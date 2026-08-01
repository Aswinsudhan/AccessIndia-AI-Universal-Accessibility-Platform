const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'accessindia_ai_super_secret_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection
const dbPath = path.join(__dirname, 'db', 'accessindia.db');

// Ensure DB exists or seed automatically if not found
if (!fs.existsSync(dbPath)) {
  console.log('Database file missing. Initializing database seeder...');
  require('./db/seed.js');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to AccessIndia SQLite Database.');
});

// Helper JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', platform: 'AccessIndia AI', timestamp: new Date() });
});

// 2. Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'USER', phone, language = 'en', accessibility_needs = 'wheelchair' } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Name, email, and password required' });

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (name, email, password_hash, role, phone, preferred_language, accessibility_needs) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hash, role, phone, language, accessibility_needs],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email already registered' });
      const token = jwt.sign({ id: this.lastID, name, email, role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: this.lastID, name, email, role, preferred_language: language } });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, preferred_language: user.preferred_language } });
  });
});

// 3. Search & List Businesses
app.get('/api/businesses', (req, res) => {
  const { q, city, category, feature, min_score } = req.query;
  let sql = `SELECT b.* FROM businesses b WHERE 1=1`;
  let params = [];

  if (q) {
    sql += ` AND (b.name LIKE ? OR b.description LIKE ? OR b.address LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (city) {
    sql += ` AND LOWER(b.city) = LOWER(?)`;
    params.push(city);
  }
  if (category) {
    sql += ` AND LOWER(b.category) = LOWER(?)`;
    params.push(category);
  }
  if (min_score) {
    sql += ` AND b.accessibility_score >= ?`;
    params.push(parseInt(min_score));
  }

  sql += ` ORDER BY b.accessibility_score DESC, b.overall_rating DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Filter by specific accessibility feature if passed
    if (feature) {
      db.all(
        `SELECT DISTINCT business_id FROM accessibility_features WHERE LOWER(feature_name) LIKE ? AND status = 'GREEN'`,
        [`%${feature.toLowerCase()}%`],
        (err, featRows) => {
          if (err) return res.json(rows);
          const validIds = new Set(featRows.map(f => f.business_id));
          const filtered = rows.filter(r => validIds.has(r.id));
          return res.json(filtered);
        }
      );
    } else {
      res.json(rows);
    }
  });
});

// 4. Get Business Detail by ID with Score, Features, Entrances, Parking, Food Court, Emergency
app.get('/api/businesses/:id', (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM businesses WHERE id = ?`, [id], (err, business) => {
    if (err || !business) return res.status(404).json({ error: 'Business not found' });

    db.all(`SELECT * FROM accessibility_features WHERE business_id = ?`, [id], (err, features) => {
      db.all(`SELECT * FROM entrances WHERE business_id = ? ORDER BY is_recommended DESC, walking_distance_meters ASC`, [id], (err, entrances) => {
        db.get(`SELECT * FROM parking_lots WHERE business_id = ?`, [id], (err, parking) => {
          db.all(`SELECT * FROM food_courts WHERE business_id = ?`, [id], (err, food_courts) => {
            db.get(`SELECT * FROM emergency_facilities WHERE business_id = ?`, [id], (err, emergency) => {
              db.all(`SELECT * FROM reviews WHERE business_id = ? ORDER BY id DESC`, [id], (err, reviews) => {
                res.json({
                  ...business,
                  features: features || [],
                  entrances: entrances || [],
                  parking: parking || { total_spaces: 0, occupied_spaces: 0, accessible_spaces: 0 },
                  food_courts: food_courts || [],
                  emergency: emergency || {},
                  reviews: reviews || []
                });
              });
            });
          });
        });
      });
    });
  });
});

// 5. Smart Entrance Recommendation Engine Endpoint
app.get('/api/businesses/:id/entrances', (req, res) => {
  const id = req.params.id;
  db.all(`SELECT * FROM entrances WHERE business_id = ? ORDER BY is_recommended DESC, walking_distance_meters ASC`, [id], (err, entrances) => {
    if (err) return res.status(500).json({ error: err.message });
    const recommended = entrances.find(e => e.is_recommended === 1) || entrances[0];
    res.json({
      recommended_entrance: recommended,
      all_entrances: entrances
    });
  });
});

// 6. CCTV Parking Occupancy AI Simulator Endpoint
app.post('/api/businesses/:id/parking/cctv-analyze', (req, res) => {
  const id = req.params.id;
  // Simulates AI Computer Vision object detection on parking CCTV feed
  db.get(`SELECT * FROM parking_lots WHERE business_id = ?`, [id], (err, parking) => {
    if (err || !parking) return res.status(404).json({ error: 'Parking data unavailable' });

    // Mock AI Computer Vision detection output
    const simulatedAvailable = Math.max(1, Math.floor(parking.accessible_spaces * (0.3 + Math.random() * 0.5)));
    const occupied = parking.accessible_spaces - simulatedAvailable;

    res.json({
      timestamp: new Date().toISOString(),
      cctv_camera_id: 'CAM-PK-04-AI',
      ai_model: 'Roboflow-YOLOv8-AccessibleParking-V2',
      confidence_score: '98.4%',
      detected_wheelchair_bays: parking.accessible_spaces,
      occupied_accessible_bays: occupied,
      available_accessible_bays: simulatedAvailable,
      recommendation: simulatedAvailable > 0 ? `Park at Zone A (Bay A-${simulatedAvailable}) near North Gate Entrance.` : 'Accessible bays full. Diverting to Valet Drop-off Zone.'
    });
  });
});

// 7. Accessibility Route Planner Endpoint
app.get('/api/routes/plan', (req, res) => {
  const { from_lat, from_lng, to_lat, to_lng, mode = 'wheelchair' } = req.query;

  // Step-Free Routing Algorithm Simulation
  res.json({
    mode,
    total_distance_km: 1.4,
    estimated_minutes: 18,
    route_quality: 'GREEN', // GREEN = Step-free, YELLOW = Partial, RED = Stairs/Obstacles
    steps: [
      { instruction: 'Start from North Plaza Ramp with continuous tactile paving line', distance_meters: 150, accessibility: 'GREEN' },
      { instruction: 'Cross wide pedestrian signal crossing with audible beeper', distance_meters: 80, accessibility: 'GREEN' },
      { instruction: 'Use elevator E-1 at Central Terminal to ascend to Level 1', distance_meters: 45, accessibility: 'GREEN' },
      { instruction: 'Follow wide corridor (2.4m clearance) directly to Destination Entrance', distance_meters: 210, accessibility: 'GREEN' }
    ]
  });
});

// 8. AI Assistant Chatbot Endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message, language = 'en', business_id } = req.body;
  const msgLower = (message || '').toLowerCase();

  let reply = '';
  if (msgLower.includes('entrance') || msgLower.includes('gate') || msgLower.includes('ramp')) {
    reply = 'For the best wheelchair accessibility, always use the North Gate (Main Plaza). It features a 1:12 slope ramp, 1.8m wide automatic sliding doors, and is just 10 meters away from elevator lift 1.';
  } else if (msgLower.includes('parking') || msgLower.includes('car') || msgLower.includes('cctv')) {
    reply = 'There are dedicated wheelchair-accessible parking spots located right near Entrance Gate A. Our live CCTV AI vision scanner indicates 4 free accessible bays currently available.';
  } else if (msgLower.includes('restroom') || msgLower.includes('toilet') || msgLower.includes('washroom')) {
    reply = 'Accessible unisex restrooms with grab rails, low emergency pull cords, and automated taps are located on all floors adjacent to Lifts 1 and 3.';
  } else if (msgLower.includes('route') || msgLower.includes('navigate') || msgLower.includes('direction')) {
    reply = 'I recommend taking the step-free Green Route via the North Elevator. Avoid the South Corridor as it currently has maintenance stairs.';
  } else {
    reply = `Namaste! AccessIndia AI Assistant here. I can help you find wheelchair ramps, tactile paving, accessible restrooms, EV charging bays, and recommended entrances. How can I assist your visit today?`;
  }

  res.json({
    reply,
    language,
    suggested_actions: ['Show Recommended Entrance', 'Check CCTV Parking Status', 'Plan Accessible Route', 'Call Emergency Desk']
  });
});

// 9. Community Accessibility Report Endpoint
app.post('/api/reports', (req, res) => {
  const { business_id, issue_type, description } = req.body;
  db.run(
    `INSERT INTO accessibility_reports (business_id, issue_type, description, status) VALUES (?, ?, ?, 'PENDING')`,
    [business_id, issue_type, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, report_id: this.lastID, message: 'Accessibility report submitted for verification.' });
    }
  );
});

// 10. Admin Analytics Endpoint
app.get('/api/admin/analytics', (req, res) => {
  db.get(`SELECT COUNT(*) as total_businesses, AVG(accessibility_score) as avg_score FROM businesses`, (err, bStats) => {
    db.get(`SELECT COUNT(*) as total_users FROM users`, (err, uStats) => {
      db.get(`SELECT COUNT(*) as pending_reports FROM accessibility_reports WHERE status = 'PENDING'`, (err, rStats) => {
        res.json({
          total_businesses: bStats.total_businesses || 0,
          avg_accessibility_score: Math.round(bStats.avg_score || 0),
          total_users: uStats.total_users || 0,
          pending_verifications: rStats.pending_reports || 0,
          verified_cities: ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata']
        });
      });
    });
  });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AccessIndia AI Server running on http://localhost:${PORT}`);
  console.log(` Universal Accessibility & Smart Facility Discovery Platform`);
  console.log(`====================================================`);
});
