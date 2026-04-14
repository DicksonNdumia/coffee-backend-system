import pool from "../config/db.config.js";

// CREATE TABLE farmers_data (
//     id SERIAL PRIMARY KEY,

//     farmer_id INTEGER REFERENCES farmers_profile(id) ON DELETE SET NULL,
//     season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
//     delivery_session_id INTEGER REFERENCES delivery_sessions(id),

//     quantity INTEGER NOT NULL CHECK (quantity > 0),
//     grade VARCHAR(50),

//     delivery_date DATE DEFAULT CURRENT_DATE,

//     created_at TIMESTAMP DEFAULT NOW()
// );
