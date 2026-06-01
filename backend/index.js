/**
 * index.js — Express server entry point
 * 24/7 backend web service for WeatherGlobe.
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {
  getGlobalHistory,
  saveGlobalHistory,
  getGlobalPins,
  saveGlobalPin,
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests (allows frontend dev server and hosted Netlify deployment)
app.use(cors());

// Parse incoming request bodies
app.use(bodyParser.json());

// Root endpoint — Status report
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '☁️ WeatherGlobe Shared Backend API is fully operational 24/7.',
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   REST API Endpoints
   ============================================================ */

/**
 * GET /api/history
 * Returns the recent search history globally.
 */
app.get('/api/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 15;
    const history = await getGlobalHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('API Error: GET /api/history', error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

/**
 * POST /api/history
 * Adds a new location click to the global shared logs.
 */
app.post('/api/history', async (req, res) => {
  try {
    const { lat, lng, city, temp, condition } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required parameters' });
    }

    const entry = await saveGlobalHistory({ lat, lng, city, temp, condition });
    res.status(201).json(entry);
  } catch (error) {
    console.error('API Error: POST /api/history', error);
    res.status(500).json({ error: 'Failed to record search history' });
  }
});

/**
 * GET /api/pins
 * Returns all custom weather pins pinned on the globe by the community.
 */
app.get('/api/pins', async (req, res) => {
  try {
    const pins = await getGlobalPins();
    res.json(pins);
  } catch (error) {
    console.error('API Error: GET /api/pins', error);
    res.status(500).json({ error: 'Failed to retrieve weather pins' });
  }
});

/**
 * POST /api/pins
 * Places a user weather pin on the globe for everyone to see.
 */
app.post('/api/pins', async (req, res) => {
  try {
    const { lat, lng, username, message, temp, condition } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng are required to place a pin' });
    }

    const pin = await saveGlobalPin({ lat, lng, username, message, temp, condition });
    res.status(201).json(pin);
  } catch (error) {
    console.error('API Error: POST /api/pins', error);
    res.status(500).json({ error: 'Failed to drop weather pin' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 WeatherGlobe Backend API running at http://localhost:${PORT}`);
});
