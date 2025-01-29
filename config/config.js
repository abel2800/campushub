require('dotenv').config();

const config = {
  development: {
    username: 'postgres',  // hardcoded for now
    password: '1992',      // hardcoded for now
    database: 'campushub',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};

module.exports = config; 