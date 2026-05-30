# Firebase Product App

A production-ready React dashboard with Firebase Authentication, Firestore CRUD, and Storage image uploads.

## Features

- Email/password signup and login
- Protected routes with React Router
- Firestore CRUD product management
- Image uploads to Firebase Storage
- Responsive dashboard UI with Tailwind CSS

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase project values.
2. Install dependencies:
   ```bash
   cd firebase-app
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Firebase security rules

- `firestore.rules` protects product documents by authenticated user ID.
- `storage.rules` allows authenticated users to upload product images.

## Notes

- Use a Firebase project with Authentication, Firestore, and Storage enabled.
- The app stores products in a Firestore `products` collection and links each document to `userId`.
