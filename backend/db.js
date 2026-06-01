/**
 * db.js — Database abstraction layer
 * Supports Supabase (PostgreSQL) with a transparent local JSON file fallback.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Paths for JSON fallback database
const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Supabase Client if credentials exist
let supabase = null;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✨ Connected to production Supabase database');
  } catch (error) {
    console.error('⚠️ Failed to initialize Supabase. Using JSON fallback database.', error);
  }
} else {
  console.log('ℹ️ No Supabase credentials found. Operating in fallback local JSON DB mode.');
}

// Ensure the local JSON DB exists with correct structure
function initLocalDb() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = { history: [], pins: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}
initLocalDb();

// Load local database data
function readLocalDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { history: [], pins: [] };
  }
}

// Save local database data
function writeLocalDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/* ============================================================
   Database API Operations
   ============================================================ */

/**
 * Fetch recent global search logs
 * @param {number} limit - Maximum number of entries to return
 */
export async function getGlobalHistory(limit = 15) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (!error && data) return data;
      console.warn('Supabase read error, falling back to local database:', error);
    } catch (err) {
      console.warn('Supabase connection failed, falling back to local database:', err);
    }
  }

  // Local JSON fallback
  const db = readLocalDb();
  return db.history.slice(0, limit);
}

/**
 * Save a new search log globally
 */
export async function saveGlobalHistory(entry) {
  const newEntry = {
    id: entry.id || Math.random().toString(36).substring(2, 11),
    lat: Number(entry.lat),
    lng: Number(entry.lng),
    city: entry.city || 'Unknown Location',
    temp: entry.temp || '--',
    condition: entry.condition || 'Unknown',
    timestamp: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('search_history').insert([newEntry]);
      if (!error) return newEntry;
      console.warn('Supabase insert error, falling back to local database:', error);
    } catch (err) {
      console.warn('Supabase connection failed, falling back to local database:', err);
    }
  }

  // Local JSON fallback
  const db = readLocalDb();
  db.history.unshift(newEntry);
  // Keep history tidy
  if (db.history.length > 100) db.history.pop();
  writeLocalDb(db);
  return newEntry;
}

/**
 * Fetch all custom weather pins
 */
export async function getGlobalPins() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('weather_pins')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!error && data) return data;
      console.warn('Supabase read error, falling back to local database:', error);
    } catch (err) {
      console.warn('Supabase connection failed, falling back to local database:', err);
    }
  }

  // Local JSON fallback
  const db = readLocalDb();
  return db.pins;
}

/**
 * Drop a new weather pin
 */
export async function saveGlobalPin(pin) {
  const newPin = {
    id: pin.id || Math.random().toString(36).substring(2, 11),
    lat: Number(pin.lat),
    lng: Number(pin.lng),
    username: pin.username || 'Anonymous Explorer',
    message: pin.message || 'Chillin\' here!',
    temp: pin.temp || '--',
    condition: pin.condition || 'Clear',
    timestamp: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('weather_pins').insert([newPin]);
      if (!error) return newPin;
      console.warn('Supabase insert error, falling back to local database:', error);
    } catch (err) {
      console.warn('Supabase connection failed, falling back to local database:', err);
    }
  }

  // Local JSON fallback
  const db = readLocalDb();
  db.pins.unshift(newPin);
  // Keep pins to a reasonable size
  if (db.pins.length > 500) db.pins.pop();
  writeLocalDb(db);
  return newPin;
}
