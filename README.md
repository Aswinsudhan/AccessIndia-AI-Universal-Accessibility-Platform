# AccessIndia AI – Universal Accessibility & Smart Facility Discovery Platform

[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2_AA_Compliant-success)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)

AccessIndia AI is a universal accessibility and smart facility discovery web platform built for India. The application combines key capabilities of Google Maps, Apple Maps, Wheelmap, and Zomato with a strong focus on accessibility, smart entrance recommendations, CCTV parking AI, indoor facility navigation, and 23 Indian languages support.

---

## 🌟 Key Features

### 1. WCAG 2.2 AA Accessibility & Multilingual Engine
- **High Contrast & Dark Mode**: Instant toggling between standard, high contrast, and dark themes.
- **Font Resizer & Text-to-Speech**: SpeechSynthesis API integration reading web pages out loud.
- **Voice Search & Speech Input**: Speech Recognition simulation allowing hands-free voice discovery.
- **23 Indian Languages**: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Urdu, Assamese, Konkani, Nepali, Dogri, Sindhi, Maithili, Santali, Manipuri, Bodo, Kashmiri, and Sanskrit.

### 2. Smart Entrance Recommendation (Primary PRD Requirement)
- Ranks facility entrance gates (e.g. North Gate vs South Gate) based on ramp slope (1:12), wide automatic doors, lift proximity, accessible parking proximity, and walking distance in meters.

### 3. Smart Parking & CCTV AI Occupancy Detection
- Real-time total, occupied, and accessible parking space counters.
- Built-in CCTV Camera Feed AI Scanner simulator estimating real-time available accessible bays.

### 4. 22 Granular Accessibility Feature Matrix
- Features status badges (GREEN: Available, ORANGE: Assisted, RED: Unavailable) across:
  - Wheelchair Ramp, Elevator/Lift, Escalator, Braille Lift Buttons, Voice Guided Lift, Accessible Restroom, Feeding Room, Accessible Parking, Wheelchair Entrance, Automatic Doors, Wide Entrance, Accessible Seating, Drinking Water, First Aid Kit, Medical Room, Ambulance Availability, Tactile Paving, Hearing Loop, Service Animal Friendly, Emergency Exit, Wheelchair Rental.

### 5. Interactive Leaflet Maps & Step-Free Route Planner
- Interactive maps with custom pins showing Accessibility Scores (0-100).
- Color-coded route generator (Green step-free, Yellow partial, Red inaccessible).

### 6. Role-Based Dashboards & AI Chatbot Assistant
- **Business Owner Portal**: Manage 22 feature statuses, hours, parking counters, and food court menus.
- **Admin Portal**: Platform analytics, total verified places, and community accessibility issue verification queue.
- **AI Chatbot**: Floating assistant answering questions about entrances, parking, restrooms, and step-free navigation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies & Seed Database
```bash
cd C:\Users\user.CSBS12\.gemini\antigravity\scratch\accessindia-ai
npm install
npm run seed
```

### 2. Start Local Server
```bash
npm start
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 🐳 Docker Setup (Optional)

Run the full stack containerized with PostgreSQL:
```bash
docker-compose up --build
```

---

## 🌐 Deployment Setup

### Recommended Hosting Split
- Frontend: Cloudflare Pages
- Backend: Oracle Cloud Always Free VM
- Database: Neon PostgreSQL

### Recommended Full-App Hosting Option
- Frontend: Koyeb
- Backend: Koyeb
- Database: Neon PostgreSQL

Koyeb is a better fit if you want one host for the complete app because `server.js` already serves the frontend and API together.

### Frontend Configuration
Before deploying the static site, update `config.js` with your backend URL:
```js
window.API_BASE_URL = 'https://YOUR-ORACLE-BACKEND-URL';
```

### Backend Notes
- Deploy `server.js` on Oracle Cloud as a Node app.
- Set `DATABASE_URL` in the Oracle environment.
- Make sure CORS remains enabled for the Cloudflare Pages domain.
- The frontend now calls the backend through `API_BASE_URL`, so the same code can run locally and on Cloudflare Pages.

### Oracle Cloud Deployment Steps
1. Create an Oracle Cloud Always Free VM and open ports `22` and `3000`.
2. Install Node.js 18+ and Git on the VM.
3. Clone this repository on the VM.
4. Run `npm install`.
5. Set environment variables:
```bash
PORT=3000
DATABASE_URL=your_neon_connection_string
```
6. Start the server with `npm start` or use a process manager like `pm2`.
7. Test `https://your-oracle-host/api/health` before connecting the frontend.

### Cloudflare Pages Deployment Steps
1. Connect the GitHub repository to Cloudflare Pages.
2. Choose the repository root as the build output because this is a static site.
3. Do not add a frontend build command unless you introduce one later.
4. After Oracle is live, update `config.js` to your Oracle backend URL:
```js
window.API_BASE_URL = 'https://your-oracle-host';
```
5. Redeploy Cloudflare Pages and verify the search, chatbot, route planner, and admin API calls.

### Koyeb Deployment Steps
1. Create a Koyeb app from this GitHub repository.
2. Choose the Node.js service type or Docker deployment.
3. Set the run command to `npm start`.
4. Add environment variables:
```bash
PORT=3000
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```
5. Make sure Koyeb exposes the service on the public web.
6. Test `https://your-koyeb-app/api/health` and the root page.
7. Because the frontend and backend share the same host on Koyeb, `config.js` can stay as `window.API_BASE_URL = ''`.

---

## 📊 Database Schemas
- PostgreSQL Schema: `db/schema.sql`
- SQLite Development Database: `db/accessindia.db` (Auto-generated by `seed.js`)

---

## 💡 Future Extension Architecture
The platform is designed in a modular structure to integrate external AI APIs:
- **Roboflow / Vision Models**: Custom CCTV camera parking spot detection
- **Matterport3D / Indoor GIS**: 3D indoor AR step-by-step navigation
- **AI4Bharat IndicTrans2**: Real-time neural machine translation across Indian dialects
