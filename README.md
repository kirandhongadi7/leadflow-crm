# LeadFlow CRM
LeadFlow CRM is a web app for managing sales leads, sales agents, tags, comments, and pipeline reports.
## Live demo
- **Application:** [https://leadflow-crm-h5oo.vercel.app/](https://leadflow-crm-h5oo.vercel.app/)
- **API health check:** [https://leadflow-fsmawy1q5-kiran-s.vercel.app/](https://leadflow-fsmawy1q5-kiran-s.vercel.app/)
- **API base URL:** `https://leadflow-fsmawy1q5-kiran-s.vercel.app/api`
## Features
- Create, view, update, and delete leads
- Filter leads by sales agent, status, source, and tags
- Add sales agents and tags
- Add and view comments on leads
- View pipeline and closed-lead reports
## Tech stack
- Frontend: React, Vite, Bootstrap, Axios, and Chart.js
- Backend: Node.js, Express, and Mongoose
- Database: MongoDB
- Deployment: Vercel
## Run locally
### Prerequisites
- [Node.js](https://nodejs.org/) and npm
- A MongoDB database and connection string

### 1. Clone the repository
```bash
git clone https://github.com/kirandhongadi7/leadflow-crm.git
cd leadflow-crm
```

### 2. Configure and start the backend
Install the backend dependencies:
```bash
cd backend
npm install
```
Create a `backend/.env` file and set your MongoDB connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=3000
```
Replace the example URI with a valid MongoDB connection string. Start the API:
```bash
npm run dev
```
The local API runs at `http://localhost:3000`; its health check is `http://localhost:3000/`.

### 3. Start the frontend
In another terminal, from the repository root:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (typically `http://localhost:5173`).
The frontend is configured to use the deployed API by default. To use the backend running on your machine, change the `API_BASE` value in `frontend/src/api.js` to:
```js
const API_BASE = 'http://localhost:3000/api';
```

## API endpoints
All resource endpoints are under `/api`. For example, the deployed leads endpoint is `https://leadflow-fsmawy1q5-kiran-s.vercel.app/api/leads`.
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API health check (root URL, not under `/api`) |
| `GET` | `/api/leads` | List leads. Optional query parameters: `salesAgent`, `status`, `source`, and comma-separated `tags`. |
| `GET` | `/api/leads/:id` | Get a lead by ID |
| `POST` | `/api/leads` | Create a lead |
| `PUT` | `/api/leads/:id` | Update a lead |
| `DELETE` | `/api/leads/:id` | Delete a lead |
| `GET` | `/api/leads/:id/comments` | List comments for a lead |
| `POST` | `/api/leads/:id/comments` | Add a comment to a lead |
| `GET` | `/api/agents` | List sales agents |
| `POST` | `/api/agents` | Create a sales agent |
| `GET` | `/api/tags` | List tags |
| `POST` | `/api/tags` | Create a tag |
| `GET` | `/api/report/last-week` | List leads closed in the last seven days |
| `GET` | `/api/report/pipeline` | Get the number of leads not yet closed |
| `GET` | `/api/report/closed-by-agent` | Get closed-lead counts by sales agent |

## Project structure
```text
backend/   Express API, MongoDB connection, schemas, and routes
frontend/  React application
```
