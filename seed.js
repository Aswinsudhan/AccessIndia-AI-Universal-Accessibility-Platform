const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'accessindia.db');

// Remove existing db if seeding fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

console.log('Seeding AccessIndia AI database...');

db.serialize(() => {
  // Create tables in SQLite
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      phone TEXT,
      preferred_language TEXT DEFAULT 'en',
      accessibility_needs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      phone TEXT,
      website TEXT,
      opening_hours TEXT,
      closing_hours TEXT,
      overall_rating REAL DEFAULT 4.5,
      accessibility_score INTEGER DEFAULT 85,
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accessibility_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      feature_name TEXT NOT NULL,
      status TEXT DEFAULT 'GREEN',
      details TEXT,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS entrances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      name TEXT NOT NULL,
      is_recommended INTEGER DEFAULT 0,
      walking_distance_meters INTEGER DEFAULT 0,
      has_ramp INTEGER DEFAULT 0,
      has_automatic_door INTEGER DEFAULT 0,
      lift_distance_meters INTEGER,
      accessible_parking_nearby INTEGER DEFAULT 0,
      accessible_restroom_nearby INTEGER DEFAULT 0,
      notes TEXT,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parking_lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      total_spaces INTEGER DEFAULT 100,
      occupied_spaces INTEGER DEFAULT 65,
      accessible_spaces INTEGER DEFAULT 12,
      parking_fee TEXT DEFAULT '₹50 / hr',
      cctv_ai_enabled INTEGER DEFAULT 1,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS food_courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      restaurant_name TEXT NOT NULL,
      floor_number INTEGER DEFAULT 1,
      location_description TEXT,
      is_wheelchair_accessible INTEGER DEFAULT 1,
      walking_distance_meters INTEGER DEFAULT 25,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_court_id INTEGER,
      item_name TEXT NOT NULL,
      category TEXT,
      price REAL,
      dietary_type TEXT,
      is_braille_menu_available INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY(food_court_id) REFERENCES food_courts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      ambulance_status TEXT DEFAULT 'Available 24x7',
      medical_room_location TEXT,
      security_office_phone TEXT,
      police_assistance_phone TEXT,
      fire_exit_locations TEXT,
      first_aid_kit_locations TEXT,
      emergency_contact TEXT,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      user_name TEXT,
      rating INTEGER,
      accessibility_rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accessibility_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      user_id INTEGER,
      issue_type TEXT,
      description TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Default Users
  const stmtUser = db.prepare(`INSERT INTO users (name, email, password_hash, role, phone, preferred_language, accessibility_needs) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmtUser.run('Aditi Sharma', 'user@accessindia.ai', '$2a$10$w8T.NnS42cO3Jg1y4L2q4.vNf79H0kR5x76P9L3L5T.K2U.M2G1.a', 'USER', '+919876543210', 'en', 'wheelchair,visual');
  stmtUser.run('Rajesh Kumar (Owner)', 'owner@accessindia.ai', '$2a$10$w8T.NnS42cO3Jg1y4L2q4.vNf79H0kR5x76P9L3L5T.K2U.M2G1.a', 'BUSINESS_OWNER', '+919812345678', 'hi', 'none');
  stmtUser.run('Admin AccessIndia', 'admin@accessindia.ai', '$2a$10$w8T.NnS42cO3Jg1y4L2q4.vNf79H0kR5x76P9L3L5T.K2U.M2G1.a', 'ADMIN', '+919800000000', 'en', 'none');
  stmtUser.finalize();

  // Businesses dataset
  const sampleBusinesses = [
    {
      name: 'Phoenix Marketcity Mall',
      category: 'Shopping Malls',
      description: 'Ultra-modern premier shopping center with step-free entrance, tactile paving, Braille lifts, accessible restrooms, and dedicated EV charging spots.',
      address: 'Whitefield Main Rd, Devasandra Industrial Estate, Mahadevapura',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560048',
      latitude: 12.9959,
      longitude: 77.6964,
      phone: '+91 80 6726 6111',
      website: 'https://www.phoenixmarketcity.com/bangalore',
      opening_hours: '10:00 AM',
      closing_hours: '10:00 PM',
      overall_rating: 4.8,
      accessibility_score: 96,
      is_verified: 1,
      entrances: [
        { name: 'North Gate (Main Plaza)', is_recommended: 1, walking_distance_meters: 15, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 10, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Recommended step-free entrance with wide automatic sensor glass doors and tactile flooring.' },
        { name: 'South Gate (Food Court Entry)', is_recommended: 0, walking_distance_meters: 85, has_ramp: 1, has_automatic_door: 0, lift_distance_meters: 45, accessible_parking_nearby: 0, accessible_restroom_nearby: 1, notes: 'Secondary entrance with ramp, but further from accessible parking bay.' },
        { name: 'East Gate (Lower Basement)', is_recommended: 0, walking_distance_meters: 120, has_ramp: 0, has_automatic_door: 0, lift_distance_meters: 15, accessible_parking_nearby: 1, accessible_restroom_nearby: 0, notes: 'Stairs only step down; lift available right inside basement corridor.' }
      ],
      parking: { total: 450, occupied: 280, accessible: 24, fee: '₹40 / hr', cctv: 1 },
      food_court: [
        { name: 'Dosa Plaza Accessible Kiosk', floor: 3, distance: 20, items: [{ name: 'Masala Dosa (Braille Menu Available)', category: 'South Indian', price: 120, dietary: 'Veg', braille: 1 }] },
        { name: 'Subway Step-Free Outlet', floor: 3, distance: 30, items: [{ name: 'Paneer Tikka Sub', category: 'Fast Food', price: 210, dietary: 'Veg', braille: 1 }] }
      ]
    },
    {
      name: 'AIIMS Multi-Specialty Hospital',
      category: 'Hospitals',
      description: 'National premier medical institute with full accessibility infrastructure, 24x7 emergency response, tactile paths, audio lifts, and wheelchair assistance desk.',
      address: 'Sri Aurobindo Marg, Ansari Nagar',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110029',
      latitude: 28.5672,
      longitude: 77.2100,
      phone: '+91 11 2658 8500',
      website: 'https://www.aiims.edu',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.9,
      accessibility_score: 98,
      is_verified: 1,
      entrances: [
        { name: 'Emergency & Trauma Block Entrance', is_recommended: 1, walking_distance_meters: 10, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 5, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Zero-step entrance, stretchers and wheelchairs pre-stationed at gate.' },
        { name: 'OPD Building Main Gate', is_recommended: 0, walking_distance_meters: 40, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 20, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Equipped with tactile paving and audio assistance station.' }
      ],
      parking: { total: 600, occupied: 410, accessible: 50, fee: 'Free for PwD', cctv: 1 }
    },
    {
      name: 'Kempegowda International Airport (BLR)',
      category: 'Airports',
      description: 'World-class airport terminal with seamless step-free navigation, PRM assistance, buggy service, adult changing rooms, sensory rooms, and tactile maps.',
      address: 'KIAL Rd, Devanahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560300',
      latitude: 13.1986,
      longitude: 77.7066,
      phone: '+91 80 6678 5555',
      website: 'https://www.bengaluruairport.com',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.9,
      accessibility_score: 99,
      is_verified: 1,
      entrances: [
        { name: 'Gate 2 - PRM Special Assistance Entry', is_recommended: 1, walking_distance_meters: 12, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 8, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Dedicated lane for passengers with reduced mobility with direct electric buggy station.' }
      ],
      parking: { total: 1200, occupied: 820, accessible: 80, fee: '₹100 / hr', cctv: 1 }
    },
    {
      name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      category: 'Railway Stations',
      description: 'UNESCO Heritage Railway Terminus upgraded with wheelchair ramps, battery-operated cars, tactile platform edge lines, and accessible ticket counters.',
      address: 'Chhatrapati Shivaji Maharaj Terminus, Fort',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 18.9400,
      longitude: 72.8353,
      phone: '+91 22 2262 0603',
      website: 'https://www.indianrail.gov.in',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.5,
      accessibility_score: 88,
      is_verified: 1,
      entrances: [
        { name: 'Platform 1 Suburban Concourse', is_recommended: 1, walking_distance_meters: 25, has_ramp: 1, has_automatic_door: 0, lift_distance_meters: 15, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Level entrance to platform, ramp connecting outer concourse.' }
      ],
      parking: { total: 200, occupied: 150, accessible: 15, fee: '₹30 / hr', cctv: 1 }
    },
    {
      name: 'Taj Mahal Palace & Tower',
      category: 'Hotels',
      description: 'Luxury 5-star heritage hotel with full ADA compliant rooms, step-free access across all dining venues, roll-in showers, and dedicated concierge support.',
      address: 'Apollo Bunder, Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 18.9217,
      longitude: 72.8330,
      phone: '+91 22 6665 3366',
      website: 'https://www.tajhotels.com',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.9,
      accessibility_score: 97,
      is_verified: 1,
      entrances: [
        { name: 'Heritage Wing Main Ramp Entrance', is_recommended: 1, walking_distance_meters: 8, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 12, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Valet parking with immediate ramp arrival and luggage service.' }
      ],
      parking: { total: 150, occupied: 90, accessible: 12, fee: 'Valet Included', cctv: 1 }
    },
    {
      name: 'Saravana Bhavan Accessible Dining',
      category: 'Restaurants',
      description: 'Iconic vegetarian restaurant with ground floor step-free dining, wide aisles, braille menus, accessible washroom, and trained courteous staff.',
      address: 'Kennet Lane, Egmore',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600008',
      latitude: 13.0782,
      longitude: 80.2608,
      phone: '+91 44 2819 1234',
      website: 'http://www.saravanabhavan.com',
      opening_hours: '07:00 AM',
      closing_hours: '10:30 PM',
      overall_rating: 4.7,
      accessibility_score: 91,
      is_verified: 1,
      entrances: [
        { name: 'Ground Floor Main Ramp', is_recommended: 1, walking_distance_meters: 5, has_ramp: 1, has_automatic_door: 0, lift_distance_meters: 0, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Low gradient slope, double handrails.' }
      ],
      parking: { total: 40, occupied: 25, accessible: 4, fee: 'Free Parking', cctv: 1 }
    },
    {
      name: 'Jio World Drive EV Charging Hub',
      category: 'EV Charging Stations',
      description: 'High-speed 150kW CCS2 & Type-2 EV Fast Charger station with dedicated wide wheelchair-accessible parking slots, shelter, and seating lounge.',
      address: 'BKC, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      latitude: 19.0657,
      longitude: 72.8687,
      phone: '+91 1800 200 5555',
      website: 'https://www.jioworlddrive.com',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.8,
      accessibility_score: 95,
      is_verified: 1,
      entrances: [
        { name: 'Drive-In EV Bay 1-6', is_recommended: 1, walking_distance_meters: 2, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 10, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Flush curb design for easy wheelchair transfer to charging cable interface.' }
      ],
      parking: { total: 30, occupied: 12, accessible: 8, fee: '₹18 / kWh', cctv: 1 }
    },
    {
      name: 'Indian Oil Swagat Bunk & Express Care',
      category: 'Petrol Bunks',
      description: '24x7 highway petroleum hub featuring free air-filling assistance, clean accessible unisex restroom, EV charger, drinking water, and snack corner.',
      address: 'NH 44, Gachibowli Outer Ring Road Interchange',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      latitude: 17.4401,
      longitude: 78.3489,
      phone: '+91 1800 233 3555',
      website: 'https://iocl.com',
      opening_hours: '00:00 AM',
      closing_hours: '11:59 PM',
      overall_rating: 4.6,
      accessibility_score: 92,
      is_verified: 1,
      entrances: [
        { name: 'Forecourt Pump Island 3 (Attended)', is_recommended: 1, walking_distance_meters: 0, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 0, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Attendant assists with fueling without leaving vehicle.' }
      ],
      parking: { total: 25, occupied: 8, accessible: 5, fee: 'Free', cctv: 1 }
    },
    {
      name: 'Cubbon Park Public Inclusive Garden',
      category: 'Parks',
      description: 'Historic 300-acre green park featuring smooth asphalt sensory walking loops, tactile trail markings, accessible restrooms, wheelchair rental booth.',
      address: 'Kasturba Road, Sampangi Rama Nagara',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      latitude: 12.9763,
      longitude: 77.5929,
      phone: '+91 80 2286 4189',
      website: 'https://horticulture.karnataka.gov.in',
      opening_hours: '06:00 AM',
      closing_hours: '07:00 PM',
      overall_rating: 4.8,
      accessibility_score: 94,
      is_verified: 1,
      entrances: [
        { name: 'Hudson Circle Gate (Accessible Trail Start)', is_recommended: 1, walking_distance_meters: 10, has_ramp: 1, has_automatic_door: 0, lift_distance_meters: 0, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Bollards spaced 1.2m apart to allow motorized wheelchairs; complimentary manual wheelchairs available at booth.' }
      ],
      parking: { total: 100, occupied: 45, accessible: 10, fee: '₹20', cctv: 1 }
    },
    {
      name: 'HDFC Bank Central Inclusive Branch',
      category: 'Banks',
      description: 'Model inclusive bank branch equipped with low-height ATM counters, talking ATM with headphone jack, step-free entrance, and tactile signage.',
      address: 'BBD Bagh, Dalhousie Square',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001',
      latitude: 22.5726,
      longitude: 88.3467,
      phone: '+91 33 6160 6161',
      website: 'https://www.hdfcbank.com',
      opening_hours: '10:00 AM',
      closing_hours: '04:00 PM',
      overall_rating: 4.7,
      accessibility_score: 93,
      is_verified: 1,
      entrances: [
        { name: 'Main Banking Concourse Ramp', is_recommended: 1, walking_distance_meters: 5, has_ramp: 1, has_automatic_door: 1, lift_distance_meters: 0, accessible_parking_nearby: 1, accessible_restroom_nearby: 1, notes: 'Automatic sliding glass doors, wheelchair friendly check-writing desk inside.' }
      ],
      parking: { total: 30, occupied: 18, accessible: 4, fee: 'Free for Customers', cctv: 1 }
    }
  ];

  // 22 Features catalog template
  const allFeatureNames = [
    'Wheelchair Ramp', 'Elevator', 'Lift', 'Escalator', 'Braille Lift Buttons',
    'Voice Guided Lift', 'Accessible Restroom', 'Feeding Room', 'Accessible Parking',
    'Wheelchair Entrance', 'Automatic Doors', 'Wide Entrance', 'Accessible Seating',
    'Drinking Water', 'First Aid Kit', 'Medical Room', 'Ambulance Availability',
    'Tactile Paving', 'Hearing Loop', 'Service Animal Friendly', 'Emergency Exit', 'Wheelchair Rental'
  ];

  const stmtBiz = db.prepare(`
    INSERT INTO businesses (owner_id, name, category, description, address, city, state, pincode, latitude, longitude, phone, website, opening_hours, closing_hours, overall_rating, accessibility_score, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtFeat = db.prepare(`
    INSERT INTO accessibility_features (business_id, feature_name, status, details) VALUES (?, ?, ?, ?)
  `);

  const stmtEnt = db.prepare(`
    INSERT INTO entrances (business_id, name, is_recommended, walking_distance_meters, has_ramp, has_automatic_door, lift_distance_meters, accessible_parking_nearby, accessible_restroom_nearby, notes, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtPark = db.prepare(`
    INSERT INTO parking_lots (business_id, total_spaces, occupied_spaces, accessible_spaces, parking_fee, cctv_ai_enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const stmtFood = db.prepare(`
    INSERT INTO food_courts (business_id, restaurant_name, floor_number, location_description, is_wheelchair_accessible, walking_distance_meters)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const stmtMenu = db.prepare(`
    INSERT INTO menu_items (food_court_id, item_name, category, price, dietary_type, is_braille_menu_available, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtEmg = db.prepare(`
    INSERT INTO emergency_facilities (business_id, ambulance_status, medical_room_location, security_office_phone, police_assistance_phone, fire_exit_locations, first_aid_kit_locations, emergency_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtRev = db.prepare(`
    INSERT INTO reviews (business_id, user_name, rating, accessibility_rating, comment) VALUES (?, ?, ?, ?, ?)
  `);

  sampleBusinesses.forEach((b, idx) => {
    stmtBiz.run(
      2, b.name, b.category, b.description, b.address, b.city, b.state, b.pincode,
      b.latitude, b.longitude, b.phone, b.website, b.opening_hours, b.closing_hours,
      b.overall_rating, b.accessibility_score, b.is_verified,
      function(err) {
        if (err) return console.error(err);
        const bizId = this.lastID;

        // Populate 22 accessibility features
        allFeatureNames.forEach((feat, fIdx) => {
          let status = 'GREEN';
          let details = 'Fully compliant and regularly inspected.';
          if (b.accessibility_score < 90 && fIdx % 5 === 0) {
            status = 'ORANGE';
            details = 'Available with staff assistance or limited hours.';
          } else if (b.accessibility_score < 80 && fIdx % 7 === 0) {
            status = 'RED';
            details = 'Under maintenance or currently not available.';
          }
          stmtFeat.run(bizId, feat, status, details);
        });

        // Entrances
        if (b.entrances) {
          b.entrances.forEach(e => {
            stmtEnt.run(bizId, e.name, e.is_recommended, e.walking_distance_meters, e.has_ramp, e.has_automatic_door, e.lift_distance_meters, e.accessible_parking_nearby, e.accessible_restroom_nearby, e.notes, b.latitude + (Math.random() - 0.5) * 0.001, b.longitude + (Math.random() - 0.5) * 0.001);
          });
        }

        // Parking
        if (b.parking) {
          stmtPark.run(bizId, b.parking.total, b.parking.occupied, b.parking.accessible, b.parking.fee, b.parking.cctv);
        }

        // Food court
        if (b.food_court) {
          b.food_court.forEach(fc => {
            stmtFood.run(bizId, fc.name, fc.floor, 'Level ' + fc.floor + ' Food Wing', 1, fc.distance, function(err) {
              if (!err && fc.items) {
                const fcId = this.lastID;
                fc.items.forEach(mi => {
                  stmtMenu.run(fcId, mi.name, mi.category, mi.price, mi.dietary, mi.braille, 1);
                });
              }
            });
          });
        }

        // Emergency
        stmtEmg.run(bizId, '24x7 Standby', 'Ground Floor Room G-04', '+919876500001', '112', 'North Corridor, South Corridor, Exit Ramp B', 'Reception & Security Kiosk', '+919876500000');

        // Reviews
        stmtRev.run(bizId, 'Priya S. (Wheelchair User)', 5, 5, 'Extremely smooth experience! North gate ramp has zero bump and lift voice prompts helped me navigate alone.');
        stmtRev.run(bizId, 'Rohan Verma (Senior Citizen)', 5, 4, 'Very helpful staff. Electric buggy was ready at gate 2.');
      }
    );
  });

  stmtBiz.finalize();
  stmtFeat.finalize();
  stmtEnt.finalize();
  stmtPark.finalize();
  stmtFood.finalize();
  stmtMenu.finalize();
  stmtEmg.finalize();
  stmtRev.finalize();

  console.log('Database successfully seeded with Indian accessibility datasets!');
});

db.close();
