# MPC Web

My Pocket Consultant - Web Application built with Next.js

## Setup Instructions

Follow these steps to get the web application running locally after cloning the repository:

### Step 1: Clone the repository
```bash
git clone https://github.com/mypocketconsultant/mpc-web.git
cd mpc-web
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create your environment file
Copy the example environment file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your:
- Firebase client configuration (API key, project ID, auth domain, etc.)
- API base URL (use `http://localhost:3002` for local development)
- Stripe public key

**Important:** Only frontend/public environment variables belong in this file. Backend secrets (database credentials, JWT secrets, Firebase private keys) should be in the `mpc-api` backend `.env` file.

### Step 4: Start the development server
```bash
npm run dev
```

### Success!
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## Requirements
- Node.js (v18 or higher)
- npm
- Running instance of [mpc-api](https://github.com/mypocketconsultant/mpc-api) backend

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## Tech Stack
- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Firebase](https://firebase.google.com/) - Authentication
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management

## Learn More

To learn more about Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
