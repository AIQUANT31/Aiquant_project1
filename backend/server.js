const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8000;
const JWT_SECRET = 'mySuperSecretKey23809504';

// Middleware setup
app.use(cors());  // cors for cross origign request
app.use(express.json());//reading json data
 
// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myappdb',
  password: 'A0gt381d@',
  port: 5432,
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  DROP TABLE IF EXISTS wallets CASCADE;
  CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    balance VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`, (err, res) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Tables created or already exist');
  }
});

// API  sa data save 
app.post('/api/submit', (req, res) => {
  const { firstName, lastName, password } = req.body;
  console.log('Received data:', { firstName, lastName, password });

  pool.query('INSERT INTO users (first_name, last_name, password) VALUES ($1, $2, $3)', [firstName, lastName, password], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ message: 'Error saving data' });
    } else {
      res.status(201).json({ message: 'Data saved successfully' });
    }
  });
});

// API for login
app.post('/api/login', (req, res) => {
  const { firstName, lastName } = req.body;
  console.log('Login attempt:', { firstName, lastName });

  pool.query('SELECT * FROM users WHERE first_name = $1 AND last_name = $2', [firstName, lastName], (err, result) => {
    if (err) {
      console.error('Error querying user:', err);
      res.status(500).json({ message: 'Error logging in' });
    } else if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.status(200).json({ token, userId: user.id });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// API to get all users
app.get('/api/user', (req, res) => {
  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ message: 'Error fetching data' });
    } else {
      res.status(200).json(result.rows);
    }
  });
});

// API to save wallet
app.post('/api/save-wallet', (req, res) => {
  const { userId, walletAddress, balance } = req.body;
  console.log('Saving wallet:', { userId, walletAddress, balance });

  pool.query('INSERT INTO wallets (user_id, wallet_address, balance) VALUES ($1, $2, $3)', [userId, walletAddress, balance], (err, result) => {
    if (err) {
      console.error('Error saving wallet:', err);
      res.status(500).json({ message: 'Error saving wallet' });
    } else {
      res.status(201).json({ message: 'Wallet saved successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
