# SD-TECH Business Management System

A complete cloud-ready business management web application for ICT services, electronics retail, printing, mobile money, and classroom supplies.

## Architecture

- Frontend: React + Vite + Tailwind CSS + Recharts + Axios
- Backend: Node.js + Express + Prisma + PostgreSQL
- Authentication: JWT + Role-based access control
- Storage: Cloudinary image upload support
- Real-time ready architecture for future socket integration

## Folders

- `frontend/` - React application
- `backend/` - Express API with Prisma ORM

## Setup

### Backend

1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example`
4. `npx prisma migrate dev --name init`
5. `npm run seed`
6. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. Create `.env` from `.env.example`
4. `npm run dev`

## Demo accounts

- Owner: `owner@sdtech.com` / `Admin123!`
- Worker: `worker@sdtech.com` / `Worker123!`

## Notes

- The backend is configured with JWT authentication and role-based access control.
- Product categories are available through the `/api/categories` endpoint.
- The frontend includes responsive dashboard layout, login flow, inventory, sales, services, expenses, debts, and reports.
- Real-time synchronization hooks can be added via Socket.io or Pusher using the existing API structure.

## Deployment

Best free hosting setup for this project:

1. **Frontend**: deploy the `frontend/` app to **Vercel**
2. **Backend**: deploy the `backend/` API to **Render** as a web service
3. **Database**: use Render PostgreSQL free tier or another free Postgres provider

This repo now includes deployment configuration files:

- `render.yaml` for Render services
- `vercel.json` for Vercel static frontend deployment

### Why this setup

- Vercel is ideal for Vite static builds and handles React routing cleanly.
- Render supports Node/Express services with environment variables and free PostgreSQL.
- This gives a clean separation of frontend and backend while keeping deployment easy.

### Frontend deployment (Vercel)

1. Push your repo to GitHub.
2. Create a new Vercel project.
3. Select the `frontend` directory.
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable:
   - `VITE_API_BASE_URL=<your-backend-url>/api`
7. Deploy.

### Backend deployment (Render)

1. Create a Render account.
2. Create a new Web Service.
3. Select the `backend` directory in your repository.
4. Set environment:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Add environment variables from `backend/.env.example`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (used for password reset links)
   - `SMTP_HOST` (optional email)
   - `SMTP_PORT` (optional email)
   - `SMTP_USER` (optional email)
   - `SMTP_PASS` (optional email)
   - `SMTP_FROM` (optional email)
   - `PORT=4000`
6. If you need a hosted database, create a free Render PostgreSQL database and use its URL for `DATABASE_URL`.

### Notes for production

- Make sure `VITE_API_BASE_URL` points to the Render backend URL.
- In the frontend, the API base URL must be full path: `https://your-backend.onrender.com/api`.
- Keep secrets safe in the hosting dashboard, not in version control.
- If backend images use Cloudinary, set Cloudinary keys in Render as environment variables.

### Local verification before deploy

1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and fill values
4. `npm run dev`
5. `cd ../frontend`
6. `npm install`
7. `cp .env.example .env` and set `VITE_API_BASE_URL=http://localhost:4000/api`
8. `npm run dev`

### Alternate free hosting

- Frontend: Netlify or Cloudflare Pages
- Backend: Railway
- Database: Supabase or ElephantSQL

This README now reflects the recommended full free deployment path for this fullstack project.
