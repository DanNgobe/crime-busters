import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import process from 'process';
dotenv.config();

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

app.get('/incidents', (req, res) => {
  db.query('SELECT * FROM incidents', (err, results) => {
    if (err) {
      console.error('Error fetching incidents: ', err);
      res.status(500).json({ message: 'Error fetching incidents' });
      return;
    }
    res.json(results);
  });
});

app.post('/incidents', (req, res) => {
  const { userId, type, title, description, latitude, longitude, urgency, status } = req.body;

  const query = `
    INSERT INTO incidents (user_id, type, title, description, latitude, longitude, urgency, status, created_at, updated_at)
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

// Error handling
app.use((req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
  next();
});

export default app;
