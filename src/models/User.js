const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\+?[1-9]\d{0,15}$/, // E.164-ish
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'fa',
      validate: {
        isIn: [['fa', 'en']],
      },
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Tehran',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          location: true,
          calls: true,
          messages: true,
          apps: false,
        },
        privacy: {
          data_retention_days: 90,
          auto_delete: true,
        },
        alerts: {
          location_alerts: true,
          emergency_contacts: [],
        }
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'deleted'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['phone'],
      },
      {
        fields: ['status'],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    await this.save();
  };

  User.prototype.toSafeJSON = function() {
    const userObj = this.toJSON();
    delete userObj.password_hash;
    delete userObj.verification_token;
    delete userObj.reset_password_token;
    delete userObj.reset_password_expires;
    return userObj;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByPhone = function(phone) {
    return this.findOne({ where: { phone } });
  };

  return User;
};

