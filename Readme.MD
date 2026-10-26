# Perplexity

A full-stack AI chat application with a React frontend and an Express/MongoDB backend. Users can create an account, chat with an AI assistant, search the web for current information, and attach documents or images for analysis.

## Features

- Account registration, login, logout, and email verification
- Authenticated chat with streamed responses over Socket.IO
- AI-assisted web search for current or real-time questions
- File attachments, including images and documents; long documents can be searched for relevant excerpts
- Chat history stored in MongoDB
- Light and dark themes

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, React Router, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, MongoDB with Mongoose
- **AI and search:** Groq, Cohere, and Tavily
- **File storage:** ImageKit
- **Email:** Gmail via Nodemailer OAuth2

## Prerequisites

- Node.js and npm
- A MongoDB database
- API credentials for Groq, Cohere, Tavily, and ImageKit
- Google OAuth2 credentials for the Gmail account used to send verification emails

## Getting started

### 1. Configure the backend

Create `Backend/.env` and fill in the required values:

```env
PORT=3000
NODE_ENV=development
IS_PRODUCTION=false

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret

GROQ_API_KEY=your_groq_api_key
COHERE_API_KEY=your_cohere_api_key
TAVILY_API_KEY=your_tavily_api_key

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_oauth_refresh_token
GOOGLE_USER=your_gmail_address

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
```

Do not commit `.env` files or real credentials to source control. The backend validates its required environment variables at startup.

### 2. Configure the frontend (optional)

The frontend defaults to the backend at `http://localhost:3000`. To use another backend URL, create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Install dependencies

Run these commands from the repository root:

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

### 4. Start the applications

Open two terminals from the repository root.

Terminal 1 — backend:

```bash
cd Backend
npm run dev
```

Terminal 2 — frontend:

```bash
cd Frontend
npm run dev
```

Open the Vite URL shown in the frontend terminal (by default, `http://localhost:5173`). The backend's HTTP CORS configuration allows this default frontend origin.

## Useful commands

Run from the relevant application directory:

| Directory  | Command           | Description                           |
|------------|-------------------|---------------------------------------|
| `Backend`  | `npm run dev`     | Start the backend with Nodemon        |
| `Frontend` | `npm run dev`     | Start the Vite development server     |
| `Frontend` | `npm run build`   | Create a production frontend build    |
| `Frontend` | `npm run preview` | Preview the production frontend build |
| `Frontend` | `npm run lint`    | Run ESLint                            |

## Project structure

```text
Backend/
  server.js
  src/
    config/       # Environment and database configuration
    controllers/  # HTTP and chat request handling
    middleware/   # Authentication and file uploads
    models/       # MongoDB models
    routes/       # Authentication and chat API routes
    services/     # AI, search, email, file, and document services
    sockets/      # Authenticated Socket.IO chat
Frontend/
  src/
    app/          # App setup and routes
    features/     # Authentication and chat interface
    lib/          # Shared API and theme utilities
```

## API overview

The backend exposes authentication routes under `/api/auth` and chat and attachment routes under `/api/chats`. Chat responses are sent over the authenticated Socket.IO connection.

## Notes

- Both apps are started separately; there is no root-level start script.
- The backend requires the configured external services to be available for their corresponding features.
- The backend package does not currently define an automated test script.
