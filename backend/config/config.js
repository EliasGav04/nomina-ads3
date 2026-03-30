require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql'; // 

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'C0zumel2025!',
    database: process.env.DB_NAME || 'nomina',
    host: process.env.DB_HOST || 'localhost',
    dialect, // 
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: (process.env.DB_NAME || 'nomina') + '_test',
    host: process.env.DB_HOST || 'localhost',
    dialect,
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'nomina',
    host: process.env.DB_HOST || 'localhost',
    dialect,
  }
};
