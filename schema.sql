-- AccessIndia AI – Clean Neon PostgreSQL Schema & Seed Data
-- Run this once in the Neon SQL Console to create tables + seed data

-- ─── Drop & Recreate for fresh setup ─────────────────────────
DROP TABLE IF EXISTS places;

-- ─── Places Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    phone VARCHAR(50),
    opening_hours VARCHAR(50),
    closing_hours VARCHAR(50),
    accessibility_score INTEGER DEFAULT 90,
    entrances JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Seed Data – 15 Major Accessible Locations Across India ──
INSERT INTO places (name, category, description, address, city, state, pincode, latitude, longitude, phone, opening_hours, closing_hours, accessibility_score, entrances, features, verified)
VALUES 
('Phoenix Marketcity Mall', 'Shopping Malls', 'Premier shopping center with step-free entrance, tactile paving, and Braille lifts.', 'Whitefield Main Rd', 'Bengaluru', 'Karnataka', '560048', 12.9959, 77.6964, '+91 80 6726 6111', '10:00 AM', '10:00 PM', 96,
  '[{"name": "North Wing Ramp", "notes": "Wide 1:10 slope ramp with auto-sensor doors"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Restrooms", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}]', true),

('AIIMS Hospital', 'Hospitals', 'National premier medical institute with full accessibility infrastructure.', 'Ansari Nagar', 'Delhi', 'Delhi', '110029', 28.5672, 77.2100, '+91 11 2658 8500', '00:00 AM', '11:59 PM', 98,
  '[{"name": "OPD Emergency Gate", "notes": "Zero step automatic door with pre-positioned wheelchairs"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Parking", "status": "GREEN"}, {"feature_name": "Sign Language", "status": "GREEN"}]', true),

('CSMT Station', 'Railway Stations', 'UNESCO Heritage Railway Terminus upgraded with wheelchair ramps and lifts.', 'Fort', 'Mumbai', 'Maharashtra', '400001', 18.9400, 72.8353, '+91 22 2262 0603', '00:00 AM', '11:59 PM', 88,
  '[{"name": "Platform 1 Concourse", "notes": "Level access ramp to platforms"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "YELLOW"}]', true),

('Phoenix Marketcity Pune', 'Shopping Malls', 'Premier destination featuring step-free access and Braille lifts.', 'Viman Nagar', 'Pune', 'Maharashtra', '411014', 18.5621, 73.9168, '+91 20 6689 0000', '10:00 AM', '10:00 PM', 95,
  '[{"name": "Central Atrium Gate", "notes": "Automatic sliding doors, ramp access"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Braille Signage", "status": "GREEN"}]', true),

('Empress City Mall', 'Shopping Malls', 'Premier accessible shopping destination in Nagpur District.', 'Cotton Market', 'Nagpur', 'Maharashtra', '440018', 21.1458, 79.0882, '+91 712 663 3333', '10:00 AM', '10:00 PM', 92,
  '[{"name": "South Entrance", "notes": "Wide ramp with anti-slip surface"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Restrooms", "status": "YELLOW"}]', true),

('Viviana Mall', 'Shopping Malls', 'Award-winning accessible mall in Thane District with tactile paving.', 'Thane West', 'Thane', 'Maharashtra', '400606', 19.2012, 72.9734, '+91 22 6170 1000', '10:00 AM', '11:00 PM', 97,
  '[{"name": "West Wing Entrance", "notes": "Level ground entrance, no steps"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}, {"feature_name": "Accessible Parking", "status": "GREEN"}]', true),

('Express Avenue Mall', 'Shopping Malls', 'Premier accessible shopping mall in Chennai.', 'Royapettah', 'Chennai', 'Tamil Nadu', '600014', 13.0587, 80.2641, '+91 44 2846 4444', '10:00 AM', '10:00 PM', 94,
  '[{"name": "Main Plaza Gate", "notes": "Wide automatic door with ramp"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}]', true),

('HITEC City Metro', 'Railway Stations', 'Modern elevated metro hub in Hyderabad equipped with wide lifts.', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4474, 78.3762, '+91 40 2333 1111', '06:00 AM', '11:00 PM', 95,
  '[{"name": "Metro Concourse Lift", "notes": "1.5m x 2m lift to all platforms, audio announcement"}]',
  '[{"feature_name": "Elevator/Lift", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}]', true),

('Science City', 'Parks', 'Large interactive science center equipped with wheelchair ramps.', 'Mirania Gardens', 'Kolkata', 'West Bengal', '700046', 22.5414, 88.3962, '+91 33 2285 4343', '09:00 AM', '08:00 PM', 91,
  '[{"name": "Main Plaza Entrance", "notes": "Pathway with ramps, no stairs"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Restrooms", "status": "GREEN"}]', true),

('Alpha One Mall', 'Shopping Malls', 'Vast shopping center with wide corridors and audio elevators.', 'Vastrapur', 'Ahmedabad', 'Gujarat', '380015', 23.0396, 72.5308, '+91 79 4019 1111', '10:00 AM', '10:00 PM', 93,
  '[{"name": "East Parking Gate", "notes": "Zero step access from parking level"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Elevator/Lift", "status": "GREEN"}]', true),

('SMS Hospital', 'Hospitals', 'Major multi-specialty hospital with ramp access across OPD blocks.', 'C Scheme', 'Jaipur', 'Rajasthan', '302004', 26.8978, 75.8153, '+91 141 256 0291', '00:00 AM', '11:59 PM', 90,
  '[{"name": "OPD Block Ramp", "notes": "Concrete ramp with side railings"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Parking", "status": "YELLOW"}]', true),

('Lulu Mall Kochi', 'Shopping Malls', 'Largest shopping mall in Kerala with full wheelchair accessibility.', 'Edappally', 'Kochi', 'Kerala', '682024', 10.0270, 76.3080, '+91 484 272 7777', '09:00 AM', '11:00 PM', 98,
  '[{"name": "Grand Atrium Gate", "notes": "Smooth ramp with sensor doors, step-free from parking"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Braille Signage", "status": "GREEN"}, {"feature_name": "Tactile Paving", "status": "GREEN"}]', true),

('City Centre Mall Nashik', 'Shopping Malls', 'Accessible mall in Nashik with step-free elevators.', 'Untwadi', 'Nashik', 'Maharashtra', '422002', 20.0003, 73.7712, '+91 253 235 6666', '10:00 AM', '10:00 PM', 91,
  '[{"name": "Main Gate", "notes": "Level entrance from road side"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}]', true),

('Pune Airport', 'Airports', 'Lohegaon Airport with full international accessibility standards.', 'Lohegaon', 'Pune', 'Maharashtra', '411032', 18.5822, 73.9197, '+91 20 2668 1100', '00:00 AM', '11:59 PM', 97,
  '[{"name": "Departures Ground Level", "notes": "Full level access with porter wheelchairs available"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Accessible Restrooms", "status": "GREEN"}, {"feature_name": "Accessible Parking", "status": "GREEN"}]', true),

('Nagpur Airport', 'Airports', 'Dr. Babasaheb Ambedkar International Airport with modern accessibility.', 'Sonegaon', 'Nagpur', 'Maharashtra', '440005', 21.0922, 79.0472, '+91 712 222 4624', '00:00 AM', '11:59 PM', 95,
  '[{"name": "Terminal 1 Main Entrance", "notes": "Level entry with accessibility assistance desk inside"}]',
  '[{"feature_name": "Wheelchair Ramp", "status": "GREEN"}, {"feature_name": "Elevator/Lift", "status": "GREEN"}]', true);

-- Verify
SELECT COUNT(*) as total_places FROM places;
