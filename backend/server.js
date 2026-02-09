const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize Sequelize with your .env variables
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.log('Error: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));