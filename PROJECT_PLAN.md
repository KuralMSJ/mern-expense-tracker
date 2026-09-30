# Project: Personal Finance & Expense Tracker Dashboard (MERN)

## Instructions for the AI assistant (read first)

You are helping me build this app. I am a beginner/intermediate programmer.

- Build **one step at a time** following the "Build Order" section. After each step, stop, summarize what you created, tell me how to run/test it, and wait for me to say "next".
- Do **not** generate the whole application at once.
- Keep code simple and readable. Add short comments explaining non-obvious parts.
- Explain any new concept (e.g., MongoDB aggregation) in 2-3 sentences the first time it appears.
- Follow the architecture, API routes, and schemas below exactly. If you think something should change, ask before deviating.
- Validate input on both frontend and backend.
- Currency is Indian Rupees (₹). Format numbers with `toLocaleString('en-IN')`.

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, Recharts (charts), Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (local or Atlas)
- **Extras:** `cors`, `dotenv`, `nodemon` (dev), a CSV library (e.g. `json2csv`) for export
- **Auth:** none for v1 (single user). Keep the design easy to extend with a `userId` later.

## Features

1. **Log transactions:** amount, type (income/expense), category, date, optional note. Full CRUD.
2. **Categories:** fixed list shared by frontend and backend.
   - Expense: Food, Rent, Utilities, Transport, Entertainment, Health, Shopping, Other
   - Income: Salary, Freelance, Other
   - The category dropdown must change when the type changes.
3. **Search & filter:** text search on note; filter by type, category, and date range (This Month, Last 30 Days, Custom Range). All filters combine. Paginated.
4. **Summary cards:** Total Income, Total Expenses, Net Balance (negative shown in red).
5. **Charts:** donut chart of expenses by category; bar/line chart of income vs expenses over time.
6. **Recent activity:** last 5 transactions, refreshed after every add/edit/delete (re-fetch; no WebSockets).
7. **Monthly category budgets:** set a ₹ limit per expense category per month.
8. **Budget progress bars:** green (< 70%), yellow (70-99%), red (>= 100%). Show real percentage even above 100%, but cap bar width visually. Put the thresholds in one shared constant/function.
9. **CSV export:** download the entire transaction history.

## Architecture

```
React (Vite)  --HTTP/JSON-->  Express API  --Mongoose-->  MongoDB
```

### Folder structure

```
finance-tracker/
├── client/
│   └── src/
│       ├── pages/        Dashboard, Transactions, Budgets
│       ├── components/   SummaryCards, TransactionForm, TransactionList,
│       │                 FilterBar, ExpenseDonut, IncomeExpenseChart,
│       │                 BudgetCard, ProgressBar
│       ├── api/          axios wrapper functions
│       ├── hooks/        useTransactions, useBudgets
│       └── constants/    categories.js, budgetColors.js
└── server/
    ├── models/           Transaction.js, Budget.js
    ├── routes/           transactions.js, budgets.js, stats.js
    ├── controllers/
    ├── middleware/       validation, errorHandler
    ├── constants/        categories.js
    └── server.js
```

### Frontend routes

| Route | Purpose |
|---|---|
| `/` | Dashboard: summary cards, charts, recent 5, budget overview |
| `/transactions` | Full list, search/filters, add/edit/delete, export button |
| `/budgets` | Set and view monthly budgets |

### Backend routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/transactions` | Create |
| GET | `/api/transactions?search=&type=&category=&from=&to=&page=&limit=` | List with filters + pagination |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |
| GET | `/api/transactions/export` | Download all as CSV |
| GET | `/api/stats/summary?from=&to=` | Total income, total expenses, net balance |
| GET | `/api/stats/by-category?from=&to=` | Expense totals per category (donut) |
| GET | `/api/stats/trend?from=&to=&groupBy=day\|month` | Income vs expenses over time |
| GET | `/api/budgets?month=YYYY-MM` | Budgets plus amount spent per category |
| PUT | `/api/budgets` | Create/update a budget (upsert by category + month) |
| DELETE | `/api/budgets/:id` | Delete a budget |

**Rule:** compute totals with MongoDB **aggregation pipelines** in the `/stats` routes. Do not send all transactions to React to sum in the browser.

## MongoDB schema

### `transactions`

| Field | Type | Notes |
|---|---|---|
| `amount` | Number | required, > 0, always positive; `type` decides the sign |
| `type` | String | enum: `income`, `expense` |
| `category` | String | enum from shared list; must match the type |
| `date` | Date | required, defaults to today |
| `note` | String | optional, max 200 chars |
| `createdAt`, `updatedAt` | Date | `timestamps: true` |

Indexes: `{ date: -1 }`; optional text index on `note`.

### `budgets`

| Field | Type | Notes |
|---|---|---|
| `category` | String | expense categories only |
| `month` | String | format `"YYYY-MM"` |
| `limit` | Number | in ₹, must be > 0 |

Unique compound index: `{ category: 1, month: 1 }`.

**Design decisions**
- Amounts are always positive; `type` determines income vs expense.
- Budget "spent" is **not stored**. Calculate it from transactions each request.
- Categories are a shared constant, not a collection (for now).
- Round amounts to 2 decimals (or store paise as integers; ask me which I prefer before building the model).

## Edge cases to handle

**Money**
- Floating-point errors; zero, negative, empty, or non-numeric amounts; very large numbers
- Indian number formatting (₹1,00,000)

**Dates**
- Time zone shifts (e.g., 11:30 PM IST stored as UTC landing on the wrong day). Store and compare dates consistently.
- "This Month" / "Last 30 Days": end of range must include the full last day (23:59:59)
- Custom range where From > To
- Future-dated transactions (allow, but confirm with me)

**Filters & search**
- Escape special characters in text search (avoid regex injection)
- Empty results need a friendly empty state
- Combined filters must work together
- Pagination for large datasets

**Budgets**
- Spending over 100% (cap bar visually, show real %)
- Budget of ₹0 is rejected
- Category with spending but no budget
- Editing/deleting a transaction, or moving its date to another month, must update budget progress

**Charts & summary**
- No data: show an empty state, not a broken chart
- Single category donut; many tiny categories (group into "Other")
- Negative net balance shown in red

**CSV export**
- Escape commas, quotes, and line breaks in notes
- Add a UTF-8 BOM so Excel shows ₹ and non-English text correctly
- Export ignores current filters (entire history); label the button accordingly
- Empty history

**General**
- Disable the submit button while saving (prevent duplicates)
- Delete confirmation
- Loading and error states on every API call
- Changing type in the form must reset an invalid category selection

## Build order (stop after each step and wait for "next")

1. **Server setup:** Express + Mongoose connection, `.env`, folder structure, health-check route
2. **Transaction model + CRUD routes** (with validation), and a way to test them (e.g., Thunder Client/Postman examples)
3. **Client setup:** Vite + React Router + Tailwind, layout, API wrapper
4. **Transaction form + list** on `/transactions` (add, edit, delete)
5. **Stats routes + summary cards + recent 5** on the dashboard
6. **Search, filters, date presets, pagination**
7. **Charts:** by-category donut and income-vs-expense trend
8. **Budgets:** model, routes (with spent calculation), page, progress bars
9. **CSV export**
10. **Polish:** empty/loading/error states, edge-case review, README

## First task

Start with **Step 1 only**. Before writing code, ask me any questions you need (e.g., local MongoDB vs Atlas, amounts as decimals vs integer paise, allow future dates or not).
