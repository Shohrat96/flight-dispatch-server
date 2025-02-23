const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const cron = require("node-cron");

const supabaseUrl = process.env.DB_SUPABASE_URL;
const supabaseKey = process.env.DB_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


let refreshJob = null; // To store the cron job reference

async function refreshSupabaseSession() {
    try {
        const { data: session } = await supabase.auth.getSession();

        if (!session || !session.session) {
            console.log("No active session found. Stopping refresh.");
            stopSessionRefresh();
            return false;
        }

        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;

        console.log("Session refreshed:", data);
        return true;
    } catch (error) {
        console.error("Error refreshing session:", error.message);
        return false;
    }
}

// Start session refresh using cron job (runs every 30 min)
function startSessionRefresh() {
    if (refreshJob) {
        console.log("Session refresh is already running.");
        return;
    }

    refreshJob = cron.schedule("*/50 * * * *", () => {
        console.log("Running session refresh...");
        refreshSupabaseSession();
    });

    console.log("Session refresh cron job started.");
}

// Stop session refresh when user logs out
function stopSessionRefresh() {
    if (refreshJob) {
        refreshJob.stop();
        refreshJob = null;
        console.log("Session refresh cron job stopped.");
    }
}

// Listen for login & logout events
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("User logged in, starting session refresh.");
        startSessionRefresh();
    } else if (event === "SIGNED_OUT") {
        console.log("User logged out, stopping session refresh.");
        stopSessionRefresh();
    }
});




module.exports = { supabase };
