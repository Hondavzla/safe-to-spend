from datetime import datetime
import calendar

from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


# Create the Flask app object.
app = Flask(__name__)

# Configure SQLAlchemy to use a local SQLite database file.
# "sqlite:///finance.db" stores the file in Flask's instance folder.
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///finance.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions (database + CORS).
db = SQLAlchemy(app)
CORS(app)


# Budget model: stores the user's monthly budget settings.
class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paycheck_amount = db.Column(db.Float, nullable=False)
    pay_frequency = db.Column(db.String(20), nullable=False)  # weekly/biweekly/monthly
    savings_percent = db.Column(db.Float, nullable=False)
    fixed_bills = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


# Expense model: stores each spending entry the user adds.
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # Stored as "YYYY-MM-DD"
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


# Core calculation engine for the dashboard.
def calculate_dashboard(budget):
    """
    Build all dashboard values from one Budget object + all Expense rows.
    Returns a dictionary that the frontend can display.
    """
    # Graceful fallback if there is no budget yet.
    if budget is None:
        return {
            "monthly_income": 0.00,
            "savings_target": 0.00,
            "money_after_savings": 0.00,
            "money_after_bills": 0.00,
            "total_spent": 0.00,
            "remaining_safe_to_spend": 0.00,
            "safe_daily_spend": 0.00,
            "status": "No Budget Set",
            "category_breakdown": {},
        }

    # Pull every expense from the database.
    expenses = Expense.query.all()

    # Convert paycheck frequency into monthly income.
    if budget.pay_frequency == "weekly":
        monthly_income = budget.paycheck_amount * 4
    elif budget.pay_frequency == "biweekly":
        monthly_income = budget.paycheck_amount * 2
    else:
        monthly_income = budget.paycheck_amount * 1

    # Savings and spendable money calculations.
    savings_target = monthly_income * (budget.savings_percent / 100)
    money_after_savings = monthly_income - savings_target
    money_after_bills = money_after_savings - budget.fixed_bills

    # Sum all expenses and also group spending by category.
    total_spent = 0.0
    category_breakdown = {}
    for expense in expenses:
        total_spent += expense.amount
        category_breakdown[expense.category] = (
            category_breakdown.get(expense.category, 0.0) + expense.amount
        )

    # Remaining amount that is "safe to spend" this month.
    remaining_safe_to_spend = money_after_bills - total_spent

    # Calculate number of days left in the current month.
    today = datetime.utcnow()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    days_left_in_month = days_in_month - today.day
    if days_left_in_month <= 0:
        days_left_in_month = 1

    # Daily recommendation based on what remains.
    safe_daily_spend = remaining_safe_to_spend / days_left_in_month

    # Health status message for quick dashboard feedback.
    if remaining_safe_to_spend >= money_after_bills * 0.25:
        status = "On Track"
    elif remaining_safe_to_spend >= 0:
        status = "Close to Limit"
    else:
        status = "Over Budget"

    # Round output values to 2 decimals for clean UI display.
    rounded_breakdown = {
        category: round(amount, 2) for category, amount in category_breakdown.items()
    }

    return {
        "monthly_income": round(monthly_income, 2),
        "savings_target": round(savings_target, 2),
        "money_after_savings": round(money_after_savings, 2),
        "money_after_bills": round(money_after_bills, 2),
        "total_spent": round(total_spent, 2),
        "remaining_safe_to_spend": round(remaining_safe_to_spend, 2),
        "safe_daily_spend": round(safe_daily_spend, 2),
        "status": status,
        "category_breakdown": rounded_breakdown,
    }


# Return JSON for 404 errors triggered by abort(404).
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404


# GET current budget settings (or None if no budget exists yet).
@app.route("/api/budget", methods=["GET"])
def get_budget():
    budget = Budget.query.first()

    if budget is None:
        return jsonify({"budget": None}), 200

    return jsonify(
        {
            "budget": {
                "id": budget.id,
                "paycheck_amount": budget.paycheck_amount,
                "pay_frequency": budget.pay_frequency,
                "savings_percent": budget.savings_percent,
                "fixed_bills": budget.fixed_bills,
                "created_at": budget.created_at.isoformat(),
            }
        }
    ), 200


# Create or update budget in one endpoint (upsert behavior).
@app.route("/api/budget", methods=["POST"])
def upsert_budget():
    data = request.get_json() or {}
    required_fields = ["paycheck_amount", "pay_frequency", "savings_percent"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    budget = Budget.query.first()
    if budget is None:
        budget = Budget(
            paycheck_amount=data["paycheck_amount"],
            pay_frequency=data["pay_frequency"],
            savings_percent=data["savings_percent"],
            fixed_bills=data.get("fixed_bills", 0.0),
        )
        db.session.add(budget)
    else:
        budget.paycheck_amount = data["paycheck_amount"]
        budget.pay_frequency = data["pay_frequency"]
        budget.savings_percent = data["savings_percent"]
        budget.fixed_bills = data.get("fixed_bills", budget.fixed_bills)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not save budget"}), 400

    return jsonify(
        {
            "budget": {
                "id": budget.id,
                "paycheck_amount": budget.paycheck_amount,
                "pay_frequency": budget.pay_frequency,
                "savings_percent": budget.savings_percent,
                "fixed_bills": budget.fixed_bills,
                "created_at": budget.created_at.isoformat(),
            }
        }
    ), 200


# List all expenses ordered by newest date first.
@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    expenses = Expense.query.order_by(Expense.date.desc()).all()

    expenses_data = [
        {
            "id": expense.id,
            "amount": expense.amount,
            "category": expense.category,
            "date": expense.date,
            "note": expense.note,
            "created_at": expense.created_at.isoformat(),
        }
        for expense in expenses
    ]

    return jsonify({"expenses": expenses_data}), 200


# Create a new expense entry.
@app.route("/api/expenses", methods=["POST"])
def create_expense():
    data = request.get_json() or {}
    required_fields = ["amount", "category", "date"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    expense = Expense(
        amount=data["amount"],
        category=data["category"],
        date=data["date"],
        note=data.get("note"),
    )
    db.session.add(expense)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not save expense"}), 400

    return jsonify(
        {
            "expense": {
                "id": expense.id,
                "amount": expense.amount,
                "category": expense.category,
                "date": expense.date,
                "note": expense.note,
                "created_at": expense.created_at.isoformat(),
            }
        }
    ), 201


# Delete one expense by primary key ID.
@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if expense is None:
        abort(404)

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted"}), 200


# Return all calculated dashboard values for the current budget state.
@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    budget = Budget.query.first()
    dashboard_data = calculate_dashboard(budget)
    return jsonify(dashboard_data), 200


# Entry point for local development.
if __name__ == "__main__":
    # Create database tables if they do not already exist.
    with app.app_context():
        db.create_all()

    # Start Flask's development server.
    app.run(debug=True)
