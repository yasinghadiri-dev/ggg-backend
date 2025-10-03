const path = require('path');

const dialect = process.env.DB_DIALECT || (process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgres');
const storage = dialect === 'sqlite' ? (process.env.DB_STORAGE || path.resolve(__dirname, '../../tmp/dev.sqlite')) : undefined;

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'monitoring_system_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect,
    storage,
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || ':memory:',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  }
};
