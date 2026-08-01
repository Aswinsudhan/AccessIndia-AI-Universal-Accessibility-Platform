-- AccessIndia AI – Clean Neon PostgreSQL Schema & Seed Data
-- Run this once in the Neon SQL Console to create tables + seed data

-- ─── Drop & Recreate for fresh setup ─────────────────────────
DROP TABLE IF EXISTS fake_submissions;
DROP TABLE IF EXISTS places;

-- ─── Places Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    panchayat VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    phone VARCHAR(50),
    opening_hours VARCHAR(50),
    closing_hours VARCHAR(50),
    accessibility_score INTEGER DEFAULT 90,
    has_lift BOOLEAN DEFAULT true,
    has_escalator BOOLEAN DEFAULT true,
    entrances JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Fake & Customer Submission Security Audit Log Table ─────
CREATE TABLE IF NOT EXISTS fake_submissions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'UNVERIFIED_CUSTOMER_FAKE',
    facility_name VARCHAR(255),
    city VARCHAR(100),
    attempted_role VARCHAR(50) DEFAULT 'CUSTOMER',
    status VARCHAR(50) DEFAULT 'BLOCKED_AND_TRAPPED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Seed Data – Major Accessible Locations Across India ─────
INSERT INTO places (name, category, description, address, city, district, panchayat, state, pincode, latitude, longitude, phone, opening_hours, closing_hours, accessibility_score, has_lift, has_escalator, entrances, features, verified)
VALUES 
('Phoenix Marketcity Mall', 'Shopping Malls', 'Premier shopping center with step-free entrance, tactile paving, and Braille lifts.', 'Whitefield Main Rd', 'Bengaluru', 'Bengaluru Urban', 'Whitefield', 'Karnataka', '560048', 12.9959, 77.6964, '+91 80 6726 6111', '10:00 AM', '10:00 PM', 96, true, true,
  '[{"name": "North Wing Ramp", "notes": "Wide 1:10 slope ramp with auto-sensor doors"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Restrooms", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}]', true),

('AIIMS Hospital', 'Hospitals', 'National premier medical institute with full accessibility infrastructure.', 'Ansari Nagar', 'Delhi', 'New Delhi', 'Connaught Place', 'Delhi', '110029', 28.5672, 77.2100, '+91 11 2658 8500', '00:00 AM', '11:59 PM', 98, true, true,
  '[{"name": "OPD Emergency Gate", "notes": "Zero step automatic door with pre-positioned wheelchairs"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Parking", "status": "GREEN"}, {"feature_name": "Sign Language", "status": "GREEN"}]', true),

('CSMT Station', 'Railway Stations', 'UNESCO Heritage Railway Terminus upgraded with wheelchair ramps and lifts.', 'Fort', 'Mumbai', 'Mumbai City', 'Colaba', 'Maharashtra', '400001', 18.9400, 72.8353, '+91 22 2262 0603', '00:00 AM', '11:59 PM', 88, true, false,
  '[{"name": "Platform 1 Concourse", "notes": "Level access ramp to platforms"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "YELLOW"}]', true),

('Phoenix Marketcity Pune', 'Shopping Malls', 'Premier destination featuring step-free access and Braille lifts.', 'Viman Nagar', 'Pune', 'Pune', 'Kothrud', 'Maharashtra', '411014', 18.5621, 73.9168, '+91 20 6689 0000', '10:00 AM', '10:00 PM', 95, true, true,
  '[{"name": "Central Atrium Gate", "notes": "Automatic sliding doors, ramp access"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Braille Signage", "status": "GREEN"}]', true),

('Lulu Mall Kochi', 'Shopping Malls', 'Largest shopping mall in Kerala with full wheelchair accessibility.', 'Edappally', 'Kochi', 'Kochi', 'Edappally', 'Kerala', '682024', 10.0270, 76.3080, '+91 484 272 7777', '09:00 AM', '11:00 PM', 98, true, true,
  '[{"name": "Grand Atrium Gate", "notes": "Smooth ramp with sensor doors, step-free from parking"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Braille Signage", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}]', true);

-- Verify
SELECT COUNT(*) as total_places FROM places;
