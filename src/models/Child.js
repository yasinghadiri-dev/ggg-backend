const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Child = sequelize.define('Child', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 25,
      },
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    monitoring_settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        location_tracking: true,
        notification_monitoring: true,
        call_monitoring: true,
        sms_monitoring: false,
        app_usage_monitoring: false,
        location_interval: 300000, // 5 minutes
        data_retention_days: 90,
        auto_sync: true,
        encrypt_data: true,
      },
    },
    consent_data: {
      type: DataTypes.JSONB,
      defaultValue: {
        parent_consent: false,
        child_consent: false,
        consent_timestamp: null,
        permissions_granted: [],
        data_types_consented: [],
      },
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_location: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    connection_status: {
      type: DataTypes.ENUM('online', 'offline', 'disconnected'),
      defaultValue: 'offline',
    },
    app_version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'suspended', 'deleted'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'children',
    indexes: [
      {
        unique: true,
        fields: ['device_id'],
      },
      {
        fields: ['parent_id'],
      },
      {
        fields: ['connection_status'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['last_seen'],
      },
    ],
  });

  // Instance methods
  Child.prototype.updateLastSeen = async function() {
    this.last_seen = new Date();
    this.connection_status = 'online';
    await this.save();
  };

  Child.prototype.updateLocation = async function(locationData) {
    this.last_location = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      timestamp: new Date(),
    };
    await this.updateLastSeen();
  };

  Child.prototype.setOffline = async function() {
    this.connection_status = 'offline';
    await this.save();
  };

  Child.prototype.updateSettings = async function(newSettings) {
    this.monitoring_settings = {
      ...this.monitoring_settings,
      ...newSettings,
    };
    await this.save();
  };

  Child.prototype.grantConsent = async function(consentData) {
    this.consent_data = {
      ...this.consent_data,
      ...consentData,
      consent_timestamp: new Date(),
    };
    await this.save();
  };

  Child.prototype.revokeConsent = async function() {
    this.consent_data = {
      parent_consent: false,
      child_consent: false,
      consent_timestamp: null,
      permissions_granted: [],
      data_types_consented: [],
    };
    this.status = 'paused';
    await this.save();
  };

  Child.prototype.toSafeJSON = function() {
    const childObj = this.toJSON();
    // Remove sensitive data if needed
    return childObj;
  };

  // Class methods
  Child.findByDeviceId = function(deviceId) {
    return this.findOne({ where: { device_id: deviceId } });
  };

  Child.findByParent = function(parentId) {
    return this.findAll({ 
      where: { parent_id: parentId, status: { [sequelize.Op.ne]: 'deleted' } }
    });
  };

  Child.findActiveChildren = function() {
    return this.findAll({ 
      where: { 
        status: 'active',
        connection_status: { [sequelize.Op.ne]: 'disconnected' }
      }
    });
  };

  return Child;
};

