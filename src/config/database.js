const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Determine dialect: prefer explicit DB_DIALECT, otherwise use sqlite for tests, else postgres
const dialect = process.env.DB_DIALECT || (process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgres');
const storage = dialect === 'sqlite' ? (process.env.DB_STORAGE || ':memory:') : undefined;

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monitoring_system',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  dialect,
  // support sqlite in-memory for tests
  storage,
  logging: process.env.NODE_ENV === 'development' ? 
    (msg) => logger.debug(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Import models
const User = require('../models/User')(sequelize);
const Child = require('../models/Child')(sequelize);
const Pairing = require('../models/Pairing')(sequelize);
const Event = require('../models/Event')(sequelize);
const ConsentLog = require('../models/ConsentLog')(sequelize);
const DeviceInfo = require('../models/DeviceInfo')(sequelize);

// Define associations

// User associations
User.hasMany(Child, { foreignKey: 'parent_id', as: 'children' });
User.hasMany(Pairing, { foreignKey: 'parent_id', as: 'pairings' });
User.hasMany(ConsentLog, { foreignKey: 'parent_id', as: 'consent_logs' });

// Child associations
Child.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });
Child.hasMany(Event, { foreignKey: 'child_id', as: 'events' });
Child.hasMany(Pairing, { foreignKey: 'child_id', as: 'pairings' });
Child.hasMany(ConsentLog, { foreignKey: 'child_id', as: 'consent_logs' });
Child.hasOne(DeviceInfo, { foreignKey: 'child_id', as: 'device_info' });

// Pairing associations
Pairing.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });
Pairing.belongsTo(Child, { foreignKey: 'child_id', as: 'child' });

// Event associations
Event.belongsTo(Child, { foreignKey: 'child_id', as: 'child' });

// ConsentLog associations
ConsentLog.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });
ConsentLog.belongsTo(Child, { foreignKey: 'child_id', as: 'child' });

// DeviceInfo associations
DeviceInfo.belongsTo(Child, { foreignKey: 'child_id', as: 'child' });

module.exports = {
  sequelize,
  models: {
    User,
    Child,
    Pairing,
    Event,
    ConsentLog,
    DeviceInfo
  }
};

