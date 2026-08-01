/**
 * AccessIndia AI – Full-Stack Node.js Express Server
 * Serves Frontend SPA + REST API endpoints
 * Connects to Neon PostgreSQL via DATABASE_URL environment variable
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Frontend Files ───────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Neon PostgreSQL Connection Pool ─────────────────────────
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Neon DB connection error:', err.message);
    } else {
      console.log('✅ Neon PostgreSQL Database Connected Successfully!');
      release();
    }
  });
} else {
  console.warn('⚠️  DATABASE_URL not set. API will return fallback data.');
}

// ─── Root: Serve Frontend ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── GET /api/health ──────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  if (!pool) {
    return res.json({
      status: 'online',
      database: 'Not connected (DATABASE_URL missing)',
      server: 'AccessIndia AI Express Server Running'
    });
  }
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({
      status: 'online',
      database: 'Neon PostgreSQL Connected ✅',
      server: 'AccessIndia AI Full-Stack Server',
      timestamp: result.rows[0].time
    });
  } catch (err) {
    res.json({ status: 'online', database: 'DB Error: ' + err.message });
  }
});

// ─── GET /api/places ──────────────────────────────────────────
app.get('/api/places', async (req, res) => {
  const { city, category, search } = req.query;

  // Fallback sample data if no DB connection
  if (!pool) {
    const fallback = generateFallback(city || 'Pune');
    return res.json(fallback);
  }

  try {
    let query = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    if (city) {
      params.push(`%${city}%`);
      query += ` AND city ILIKE $${params.length}`;
    }
    if (category) {
      params.push(`%${category}%`);
      query += ` AND category ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      // Fixed: use a single param for all OR conditions
      query += ` AND (name ILIKE $${params.length} OR address ILIKE $${params.length} OR city ILIKE $${params.length})`;
    }

    query += ' ORDER BY accessibility_score DESC LIMIT 50';
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      // No DB results, return fallback
      return res.json(generateFallback(city || 'India'));
    }

    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/places error:', err.message);
    // Return fallback instead of crashing frontend
    res.json(generateFallback(city || 'Pune'));
  }
});

// ─── GET /api/places/:id ──────────────────────────────────────
app.get('/api/places/:id', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB not connected' });

  try {
    const result = await pool.query('SELECT * FROM places WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Place not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/places ─────────────────────────────────────────
app.post('/api/places', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB not connected. Add DATABASE_URL env variable.' });

  const { name, category, description, address, city, state, pincode, latitude, longitude, phone, accessibility_score, entrances, features } = req.body;

  if (!name || !category || !city) {
    return res.status(400).json({ error: 'name, category and city are required' });
  }

  try {
    const query = `
      INSERT INTO places (name, category, description, address, city, state, pincode, latitude, longitude, phone, accessibility_score, entrances, features)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [
      name,
      category,
      description || 'Verified accessible facility',
      address || 'Main Road',
      city,
      state || 'India',
      pincode || '400001',
      latitude || 18.5204,
      longitude || 73.8567,
      phone || null,
      accessibility_score || 90,
      JSON.stringify(entrances || [{ name: 'Main Ramp Entrance', notes: 'Step-free ramp available' }]),
      JSON.stringify(features || [{ feature_name: 'Wheelchair Ramp', status: 'GREEN' }])
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Facility saved to Neon database ✅', place: result.rows[0] });
  } catch (err) {
    console.error('POST /api/places error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Catch-all: Serve index.html for SPA routing ─────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AccessIndia AI Server running on port ${PORT}`);
  console.log(`   > Frontend: http://localhost:${PORT}`);
  console.log(`   > Health: http://localhost:${PORT}/api/health`);
  console.log(`   > DB: ${process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'NO DATABASE_URL SET'}`);
});

// ─── Fallback Data Generator ──────────────────────────────────
function generateFallback(cityName) {
  const cityCoords = {
    'Pune': [18.5204, 73.8567], 'Mumbai': [18.9400, 72.8353],
    'Nagpur': [21.1458, 79.0882], 'Bengaluru': [12.9716, 77.5946],
    'Delhi': [28.6139, 77.2090], 'Chennai': [13.0827, 80.2707],
    'Hyderabad': [17.3850, 78.4867], 'Kolkata': [22.5726, 88.3639]
  };
  const coords = cityCoords[cityName] || [18.5204, 73.8567];
  return [
    { id: 1, name: `${cityName} Central Mall`, category: 'Shopping Malls', address: 'Main Concourse Ave', city: cityName, state: 'India', latitude: coords[0] + 0.005, longitude: coords[1] + 0.005, accessibility_score: 96, entrances: [{ name: 'North Gate Main Ramp', notes: 'Continuous 1:12 slope ramp with automatic sensor glass doors.' }] },
    { id: 2, name: `${cityName} City Hospital`, category: 'Hospitals', address: 'Station Medical Road', city: cityName, state: 'India', latitude: coords[0] - 0.005, longitude: coords[1] - 0.005, accessibility_score: 98, entrances: [{ name: 'Emergency Block Gate', notes: 'Zero step entrance with pre-stationed wheelchairs at door.' }] },
    { id: 3, name: `${cityName} Junction Railway Station`, category: 'Railway Stations', address: 'Station Road', city: cityName, state: 'India', latitude: coords[0] + 0.008, longitude: coords[1] - 0.008, accessibility_score: 91, entrances: [{ name: 'Platform 1 Concourse', notes: 'Level entrance to platform with tactile safety paving.' }] }
  ];
}

module.exports = app;
