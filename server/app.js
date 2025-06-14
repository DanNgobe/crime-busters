import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pkg from 'pg';
import process from 'process';
import PushNotificationService from './push-notifications.js';
import { camelCaseKeys } from './utils/camelCaseKeys.js';

const notificationService = new PushNotificationService();

dotenv.config({
  path: '.env.local',
});

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Check DB connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err);
    setTimeout(() => process.exit(1), 5000);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// Inside /incidents GET
app.get('/incidents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incident');
    res.json(camelCaseKeys(result.rows));
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ message: 'Error fetching incidents' });
  }
});

// Inside /incidents/:userId GET
app.get('/incidents/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM incident WHERE user_id = $1', [userId]);
    res.json(camelCaseKeys(result.rows));
  } catch (err) {
    console.error('Error fetching incidents by userId:', err);
    res.status(500).json({ message: 'Error fetching incidents' });
  }
});

app.post('/incidents', async (req, res) => {
  const { userId, type, title, description, latitude, longitude, urgency, status } = req.body;

  const query = `
    INSERT INTO incident (user_id, type, title, description, latitude, longitude, urgency, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [
      userId,
      type,
      title,
      description,
      latitude,
      longitude,
      urgency,
      status,
    ]);
    // Send push notification
    const notification = {
      heading: title,
      content: description,
      segment: 'law-enforcement',
      filters: [],
    };
    notificationService
      .pushNotification(notification)
      .then((response) => {
        console.log('Notification sent:', response);
      })
      .catch((error) => {
        console.error('Error sending notification:', error);
      });
    // Return the newly created incident
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Error creating incident: ', err);
    res.status(500).json({ message: 'Error creating incident' });
  }
});

// get or create a user by ID
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Try to fetch the user
    const userResult = await pool.query('SELECT * FROM "user" WHERE id = $1', [userId]);
    if (userResult.rows.length > 0) {
      res.json(camelCaseKeys(userResult.rows[0])); // user exists
    } else {
      // Insert new user
      const insertQuery = `
        INSERT INTO "user" (id, role, is_blocked, created_at, updated_at)
        VALUES ($1, 'public', false, NOW(), NOW())
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [userId]);
      res.json(camelCaseKeys(insertResult.rows[0]));
    }
  } catch (err) {
    console.error('Error fetching or creating user: ', err);
    res.status(500).json({ message: 'Error fetching or creating user' });
  }
});

app.put('/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Missing required field: status' });
  }

  const query = `
    UPDATE incident
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.status(200).json({ message: 'Incident updated successfully' });
  } catch (err) {
    console.error('Error updating incident: ', err);
    res.status(500).json({ message: 'Error updating incident' });
  }
});

// Error handling
app.use((req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
  next();
});

export default app;
