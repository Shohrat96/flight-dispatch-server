const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.DB_SUPABASE_URL;
const supabaseKey = process.env.DB_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulated storage for session (Replace this with DB or Redis)
let sessionStore = {};

// Function to refresh the session manually
async function refreshSession() {
    console.log(" session in refreshSession : ", sessionStore.refresh_token);

    if (!sessionStore.session.refresh_token) {
        console.log('No refresh token available.');
        return null;
    }

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: sessionStore.refresh_token
    });

    if (error) {
        console.error('Session refresh failed:', error.message);
        return null;
    }

    console.log('Session refreshed:', data.session);

    sessionStore = data.session; // Store updated session tokens
    console.log("session store: ", data.session);

    return data.session;
}

// Middleware to check and refresh session
async function authMiddleware(req, res, next) {
    const currentTime = Math.floor(Date.now() / 1000);

    if (!sessionStore.access_token || sessionStore.expires_at < currentTime) {
        console.log('Access token expired. Refreshing session...');
        console.log("session store: ", sessionStore);

        const newSession = await refreshSession();

        if (!newSession) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
    }

    req.supabase = supabase;
    next();
}




module.exports = { supabase, authMiddleware, sessionStore };
