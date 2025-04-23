import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import process from 'process';
import { camelCaseKeys } from './utils/camelCaseKeys.js';
dotenv.config({
  path: '.env.local',
});

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  connectTimeout: 10000, // Wait 10s before failing
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    setTimeout(() => process.exit(1), 5000); // Exit and let Docker restart it
  } else {
    console.log('Connected to database');
  }
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// Inside /incidents GET
app.get('/incidents', (req, res) => {
  db.query('SELECT * FROM incident', (err, results) => {
    if (err) {
      console.error('Error fetching incidents: ', err);
      res.status(500).json({ message: 'Error fetching incidents' });
      return;
    }
    res.json(camelCaseKeys(results));
  });
});

// Inside /incidents/:userId GET
app.get('/incidents/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM incident WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching incidents by userId: ', err);
      res.status(500).json({ message: 'Error fetching incidents' });
      return;
    }
    res.json(camelCaseKeys(results));
  });
});

app.post('/incidents', (req, res) => {
  const { userId, type, title, description, latitude, longitude, urgency, status } = req.body;

  const query = `
    INSERT INTO incident (user_id, type, title, description, latitude, longitude, urgency, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    query,
    [userId, type, title, description, latitude, longitude, urgency, status],
    (err, results) => {
      if (err) {
        console.error('Error creating incident: ', err);
        res.status(500).json({ message: 'Error creating incident' });
        return;
      }
      res.status(201).json({ id: results.insertId });
    },
  );
});

// get or create a user by ID
app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM user WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user: ', err);
      res.status(500).json({ message: 'Error fetching user' });
      return;
    }

    if (results.length > 0) {
      res.json(camelCaseKeys(results[0])); // user exists
    } else {
      const insertQuery = `
        INSERT INTO user (id, role, is_blocked, created_at, updated_at)
        VALUES (?, 'public', false, NOW(), NOW())
      `;
      db.query(insertQuery, [userId], (insertErr) => {
        if (insertErr) {
          console.error('Error creating user: ', insertErr);
          res.status(500).json({ message: 'Error creating user' });
          return;
        }

        // Return the newly created user
        db.query('SELECT * FROM user WHERE id = ?', [userId], (fetchErr, newResults) => {
          if (fetchErr) {
            console.error('Error fetching newly created user: ', fetchErr);
            res.status(500).json({ message: 'Error fetching newly created user' });
            return;
          }
          res.json(camelCaseKeys(newResults[0]));
        });
      });
    }
  });
});

// Error handling
app.use((req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
  next();
});

export default app;
