import pool from "../config/db.config.js";

// CREATE TABLE delivery_sessions (
//     id SERIAL PRIMARY KEY,
//     season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,

//     delivery_date DATE NOT NULL,
//     notes TEXT,

//     status VARCHAR(20) DEFAULT 'OPEN',

//     created_at TIMESTAMP DEFAULT NOW(),

//     UNIQUE (season_id, delivery_date) -- prevent duplicate same-day entries
// );
