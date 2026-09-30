# Finance Tracker

A single-user personal finance tracker for recording income and expenses, reviewing summaries and charts, setting monthly category budgets, searching and filtering transactions, and exporting the full transaction history as CSV.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB

## Windows Setup

### Prerequisites

Install Node.js (20.19 or newer) and npm. Start a local MongoDB server, or prepare a MongoDB Atlas connection string.

### Configure the backend

From the project root, copy the example environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

The example uses a local development database named `finance-tracker-dev`. If using Atlas, replace `MONGODB_URI` in `backend/.env` with your own connection string and keep the database name set to `finance-tracker-dev`. Do not commit `backend/.env`.

Install and start the API in a PowerShell terminal:

```powershell
Set-Location backend
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default.

### Configure and start the frontend

Open a second PowerShell terminal from the project root:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. The frontend uses `http://localhost:5000/api` by default. To use another API base URL, set `VITE_API_BASE_URL` in a frontend `.env` file.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/transactions` | Create a transaction |
| `GET` | `/api/transactions` | List, search, filter, and paginate transactions |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/transactions/export` | Download all transactions as CSV |
| `GET` | `/api/stats/summary?from=&to=` | Income, expenses, and balance totals |
| `GET` | `/api/stats/by-category?from=&to=` | Expense totals by category |
| `GET` | `/api/stats/trend?from=&to=&groupBy=day\|month` | Income and expense totals over time |
| `GET` | `/api/budgets?month=YYYY-MM` | Monthly budgets with calculated spend and percentage used |
| `PUT` | `/api/budgets` | Upsert a category/month budget limit |
| `DELETE` | `/api/budgets/:id` | Delete a budget |

Transaction list filters may be combined: `search`, `type`, `category`, `from`, `to`, `page`, and `limit`. Date range values use `YYYY-MM-DD`; the `to` date includes the full day. Budget months use `YYYY-MM`.

## Known Limitations

- The app is single-user and has no login, authorization, or user-specific data separation.
- Currency is fixed to Indian rupees (INR).
- Categories are fixed in code; users cannot create categories.
- Dashboard charts show all-time data; date-range filters are available on the transaction list, not the dashboard.
