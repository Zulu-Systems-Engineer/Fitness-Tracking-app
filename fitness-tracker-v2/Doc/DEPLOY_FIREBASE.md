# Deploy to Firebase Hosting

This file explains how to build the `apps/web` site and deploy it to Firebase Hosting from Windows PowerShell.

Before you start
- Install the Firebase CLI: `npm install -g firebase-tools` (requires Node/npm)
- Ensure you have a Firebase project created in the Firebase Console
- Copy `apps/web/firebase-config-example.txt` to `apps/web/.env.local` and replace the placeholders with your actual values (see `FIREBASE_SETUP.md`).
- Replace `your-firebase-project-id` in `.firebaserc` with your Firebase project id.

Steps

1. Sign in to Firebase (interactive):

```powershell
firebase login
```

2. (Optional) Initialize the project (if you want to recreate `firebase.json` interactively)

```powershell
cd "f:\Mobile Apps\fitness-tracker-app\fitness-tracker-v2"
firebase init hosting
```

When prompted, choose the existing project and set the public directory to `apps/web/dist`. When asked if this is a single-page app, answer `yes`.

3. Build the web app

```powershell
cd "f:\Mobile Apps\fitness-tracker-app\fitness-tracker-v2\apps\web"
pnpm install
pnpm run build
```

4. Deploy to Firebase Hosting

```powershell
cd "f:\Mobile Apps\fitness-tracker-app\fitness-tracker-v2"
firebase deploy --only hosting
```

After deploy completes, the CLI will print the hosting URL.

Notes about Server-Side Rendering (SSR)
- This repository currently builds a client-side React app (Vite). For true SSR with Firebase you can use Cloud Functions or Cloud Run to serve server-rendered pages. That requires converting the app to an SSR-capable framework (Next.js, Remix, or Vite SSR) and adding a `functions` deploy target.
- If you'd like, I can prepare a starter `functions` SSR integration (Firebase Functions + Vite SSR or migrate to Next.js) — tell me which approach you prefer.

Persistence and workouts
- The app is already configured to save workouts to Firestore (see `FIREBASE_SETUP.md`). As long as the deployed app has the correct `.env.local` (Firebase config) and Firestore rules allow the operations, created workouts will persist across refreshes.
