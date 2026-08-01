-- AccessIndia AI – Universal Accessibility & Smart Facility Discovery Platform
-- PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'USER', -- USER, BUSINESS_OWNER, ADMIN
    phone VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en',
    accessibility_needs TEXT[], -- e.g. ARRAY['wheelchair', 'visual', 'senior']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Restaurant, Hospital, Mall, Hotel, EV Charging, Petrol Bunk, Railway Station, Airport, Bus Station, Govt Office, School, College, Park, Pharmacy, Bank
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    opening_hours VARCHAR(100),
    closing_hours VARCHAR(100),
    overall_rating NUMERIC(3, 2) DEFAULT 0.0,
    accessibility_score INT DEFAULT 0, -- Calculated 0-100
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accessibility_features (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL, -- Wheelchair Ramp, Elevator, Lift, Escalator, Braille Lift Buttons, Voice Guided Lift, Accessible Restroom, Feeding Room, Accessible Parking, Wheelchair Entrance, Automatic Doors, Wide Entrance, Accessible Seating, Drinking Water, First Aid Kit, Medical Room, Ambulance Availability, Tactile Paving, Hearing Loop, Service Animal Friendly, Emergency Exit, Wheelchair Rental
    status VARCHAR(20) DEFAULT 'GREEN', -- GREEN (Available), ORANGE (Limited/Assisted), RED (Not Available)
    details TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_business_feature UNIQUE (business_id, feature_name)
);

CREATE TABLE IF NOT EXISTS entrances (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. North Gate, South Gate, Main Entry
    is_recommended BOOLEAN DEFAULT FALSE,
    walking_distance_meters INT DEFAULT 0,
    has_ramp BOOLEAN DEFAULT FALSE,
    has_automatic_door BOOLEAN DEFAULT FALSE,
    lift_distance_meters INT,
    accessible_parking_nearby BOOLEAN DEFAULT FALSE,
    accessible_restroom_nearby BOOLEAN DEFAULT FALSE,
    notes TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS parking_lots (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    total_spaces INT DEFAULT 0,
    occupied_spaces INT DEFAULT 0,
    accessible_spaces INT DEFAULT 0,
    parking_fee VARCHAR(50) DEFAULT 'Free',
    cctv_ai_enabled BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_courts (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    restaurant_name VARCHAR(150) NOT NULL,
    floor_number INT DEFAULT 1,
    location_description VARCHAR(255),
    is_wheelchair_accessible BOOLEAN DEFAULT TRUE,
    walking_distance_meters INT DEFAULT 20
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    food_court_id INT REFERENCES food_courts(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    price NUMERIC(8, 2),
    dietary_type VARCHAR(50), -- Veg, Non-Veg, Jain, Vegan
    is_braille_menu_available BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS emergency_facilities (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    ambulance_status VARCHAR(50) DEFAULT 'On-Call',
    medical_room_location VARCHAR(100),
    security_office_phone VARCHAR(20),
    police_assistance_phone VARCHAR(20),
    fire_exit_locations TEXT,
    first_aid_kit_locations TEXT,
    emergency_contact VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    accessibility_rating INT CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(255),
    is_accessibility_focused BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accessibility_reports (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, VERIFIED, RESOLVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50) NOT NULL,
    is_supported BOOLEAN DEFAULT TRUE
);
