// Where the backend lives.
//  - npm run dev   -> http://localhost:3000 (the backend runs separately)
//  - production    -> "" (empty) = the SAME address the page was loaded from, because the backend serves the frontend
//  - VITE_API_URL  -> overrides both, if you ever host the backend somewhere else
const fromEnv = import.meta.env.VITE_API_URL;

export const API_URL =
    fromEnv !== undefined && fromEnv !== ""
        ? fromEnv.replace(/\/+$/, "")
        : import.meta.env.PROD
            ? ""
            : "http://localhost:3000";