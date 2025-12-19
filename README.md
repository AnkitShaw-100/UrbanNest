# Urban Nest Real Estate

A full-stack real estate application with a React + TypeScript (Vite) frontend and an Express + MongoDB backend. Buyers can browse property listings, while sellers can create and manage listings with image uploads.

## Tech Stack

* Frontend: React 18, TypeScript, Vite, Tailwind CSS
* Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer
* Deployment: Vercel (frontend), any Node hosting platform (backend)

## Features

* Buyer dashboard to browse and view property listings
* Seller dashboard to create, update, and delete listings
* Image uploads served directly from the backend
* JWT-based authentication
* Listing filtering and pagination

## Project Structure

```
backend/    # API, auth, database, uploads
frontend/   # React client (Vite)
uploads/    # Stored property images
```

## Getting Started

**Requirements:** Node.js 18+, MongoDB

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Notes

* Images are stored in `uploads/` and served via `/uploads/<filename>`
* API base URL is configured in `frontend/src/services/api.ts`
* Ensure CORS allows the frontend origin

## License

Learning and demo project
