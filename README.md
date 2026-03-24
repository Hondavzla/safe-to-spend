# Safe-to-Spend Finance Tracker

A full-stack personal finance app that helps users understand exactly how much they can safely spend while staying on track with their monthly savings goal.

## Live Demo
git clone https://github.com/Hondavzla/safe-to-spend.git

## Screenshots
(screenshots coming soon)

## How It Works
Users set up their monthly budget by entering income, savings goal, and fixed bills.  
The app then tracks variable expenses and continuously calculates how much money is still safe to spend.  
It also calculates a daily safe spending amount based on how many days are left in the month.  
This gives users a clear, simple number they can use to make better spending decisions every day.

## Features
- Hero dashboard showing “Available to Spend”
- Dynamic safe-to-spend calculation based on income, savings, fixed bills, and expenses
- Safe daily spending amount
- Status labels: On Track / Close to Limit / Over Budget
- Budget Status card with savings and spending indicators
- Spending by Category donut chart
- Budget Breakdown bar chart
- Chart carousel with arrow and dot navigation
- Recent Activity list (last 5 expenses)
- Summary cards for key metrics (income, savings target, total spent, safe daily spend)
- Setup page for income, pay frequency, savings goal, and fixed bills
- Expenses page to add, view, and delete variable expenses
- Full dark theme UI across pages
- Fade-in dashboard animations
- Responsive grid-based layout

## Future Improvements
- User authentication so each person has a private dashboard
- Bank account sync to auto-import transactions
- Quick Tools section (tracked in GitHub Issues)
- Mobile app version

## Tech Stack

### Backend
- Python
- Flask (REST API)
- SQLite
- Flask-SQLAlchemy

### Frontend
- React (Vite)
- Tailwind CSS v3
- Chart.js + react-chartjs-2

### Tooling & Deployment
- Git + GitHub
- Render (backend)
- Render or Netlify (frontend)

## Project Structure
```text
safe-to-spend/
├── backend/
│   ├── app.py                 # Flask app, routes, and core budget logic
│   ├── requirements.txt       # Python dependencies
│   ├── Procfile               # Render process config
│   └── instance/
│       └── finance.db         # SQLite database file
├── frontend/
│   ├── package.json           # Frontend scripts and npm dependencies
│   ├── index.html             # Vite HTML entry file
│   └── src/
│       ├── main.jsx           # React app entry point
│       ├── App.jsx            # Router and page composition
│       ├── api.js             # Centralized API calls to Flask backend
│       ├── index.css          # Tailwind directives and global styles
│       ├── pages/
│       │   ├── Setup.jsx      # Budget setup form page
│       │   ├── Expenses.jsx   # Expense add/view/delete page
│       │   └── Dashboard.jsx  # Financial summary dashboard page
│       └── components/
│           └── Navbar.jsx     # Shared top navigation component
└── README.md                  # Project documentation
