-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),

    date_of_birth DATE,
    location VARCHAR(255),
    county VARCHAR(100),

    phone_number VARCHAR(20) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- FARMERS DATA (Deliveries)
-- =========================
CREATE TABLE farmers_data (
    id SERIAL PRIMARY KEY,
    
    farmer_id INTEGER REFERENCES farmers_profile(id) ON DELETE SET NULL,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    grade VARCHAR(50),

    delivery_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE delivery_sessions (
    id SERIAL PRIMARY KEY,

    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,

    delivery_date DATE NOT NULL,

    notes TEXT, -- optional: "coffee is increasing, add extra day"

    is_open BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);


-- =========================
-- ANNOUNCEMENTS
-- =========================
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    image_public_id TEXT,
    description TEXT NOT NULL,

    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- MEETINGS
-- =========================
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    attendance INTEGER DEFAULT 0,

    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- MINUTES
-- =========================
CREATE TABLE minutes (
    id SERIAL PRIMARY KEY,

    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,

    title VARCHAR(100) NOT NULL,

    leader_present INTEGER DEFAULT 0,
    leader_absent INTEGER DEFAULT 0,
    members_present INTEGER DEFAULT 0,
    members_absent INTEGER DEFAULT 0,

    agenda_one TEXT,
    agenda_two TEXT,
    agenda_three TEXT,
    agenda_four TEXT,

    aob TEXT,

    presided_by INTEGER REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- factory_data
-- =========================

CREATE TABLE factory_data (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),

    motto TEXT,
    mission TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100), -- e.g "2025 Season"
    
    start_date DATE,
    end_date DATE,

    price_per_kg INTEGER, -- e.g 155
    factory_deduction INTEGER DEFAULT 0, -- e.g 5

    is_closed BOOLEAN DEFAULT FALSE, -- once finalized

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- INDEXES (Performance)
-- =========================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farmers_created_for ON farmers_data(created_for);
CREATE INDEX idx_rates_created_by ON rates(created_by);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);


CREATE TABLE farmers_profile (
    id SERIAL PRIMARY KEY,

    farmer_no VARCHAR(50) UNIQUE NOT NULL, -- like 1333
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- ROLES SEED DATA
-- =========================
INSERT INTO roles (name, description)
VALUES 
    ('admin', 'Full access to all resources'),
    ('director', 'Sets the price per kilo'),
    ('farmer', 'Provides coffee deliveries');



--- Adding rules to the data ALTER TABLE farmers_profile 
ADD CONSTRAINT unique_user UNIQUE (user_id);

ALTER TABLE farmers_profile 
ADD CONSTRAINT unique_farmer_no UNIQUE (farmer_no);





--- Adding a column year
ALTER TABLE seasons ADD COLUMN year INTEGER;


ALTER TABLE seasons ADD CONSTRAINT unique_season_year UNIQUE (year);


ALTER TABLE seasons ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN';

ALTER TABLE farmers_data
ADD COLUMN delivery_session_id INTEGER REFERENCES delivery_sessions(id);

ALTER TABLE delivery_sessions ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN';