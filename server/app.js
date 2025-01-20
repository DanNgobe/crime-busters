import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// Error handling
app.use((req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
  next();
});

export default app;
