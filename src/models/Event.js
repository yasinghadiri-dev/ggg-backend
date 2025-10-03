const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    child_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'children',
        key: 'id',
      },
    },
    event_type: {
      type: DataTypes.ENUM(
        'location',
        'notification',
        'call_incoming',
        'call_outgoing',
        'call_ended',
        'sms_received',
        'sms_sent',
        'app_installed',
        'app_uninstalled',
        'consent_granted',
        'consent_revoked',
        'pairing_request',
        'pairing_success',
        'connection_lost',
        'connection_restored'
      ),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    encrypted_payload: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    device_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'events',
    indexes: [
      {
        fields: ['child_id'],
      },
      {
        fields: ['event_type'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['device_timestamp'],
      },
      {
        fields: ['is_processed'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['child_id', 'event_type', 'timestamp'],
      },
    ],
  });

  // Instance methods
  Event.prototype.markAsProcessed = async function() {
    this.is_processed = true;
    this.processed_at = new Date();
    await this.save();
  };

  Event.prototype.getDecryptedPayload = function() {
    // If encrypted, decrypt the payload
    if (this.is_encrypted && this.encrypted_payload) {
      const crypto = require('../utils/encryption');
      try {
        return JSON.parse(crypto.decrypt(this.encrypted_payload));
      } catch (error) {
        console.error('Failed to decrypt payload:', error);
        return this.payload;
      }
    }
    return this.payload;
  };

  Event.prototype.setPriority = function() {
    // Auto-set priority based on event type
    const urgentEvents = ['call_incoming', 'sms_received'];
    const highEvents = ['location', 'call_outgoing', 'call_ended'];
    const normalEvents = ['notification', 'app_installed'];
    
    if (urgentEvents.includes(this.event_type)) {
      this.priority = 'urgent';
    } else if (highEvents.includes(this.event_type)) {
      this.priority = 'high';
    } else if (normalEvents.includes(this.event_type)) {
      this.priority = 'normal';
    } else {
      this.priority = 'low';
    }
  };

  // Class methods
  Event.findByChild = function(childId, options = {}) {
    const whereClause = { child_id: childId };
    
    if (options.eventType) {
      whereClause.event_type = options.eventType;
    }
    
    if (options.startDate && options.endDate) {
      whereClause.timestamp = {
        [sequelize.Op.between]: [options.startDate, options.endDate]
      };
    }

    return this.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: options.limit || 100,
      offset: options.offset || 0,
    });
  };

  Event.findUnprocessed = function() {
    return this.findAll({
      where: { is_processed: false },
      order: [['priority', 'DESC'], ['timestamp', 'ASC']],
    });
  };

  Event.findRecentByType = function(childId, eventType, hours = 24) {
    const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return this.findAll({
      where: {
        child_id: childId,
        event_type: eventType,
        timestamp: {
          [sequelize.Op.gte]: startTime
        }
      },
      order: [['timestamp', 'DESC']],
    });
  };

  Event.getLocationHistory = function(childId, options = {}) {
    const whereClause = {
      child_id: childId,
      event_type: 'location'
    };

    if (options.startDate && options.endDate) {
      whereClause.timestamp = {
        [sequelize.Op.between]: [options.startDate, options.endDate]
      };
    }

    return this.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: options.limit || 1000,
    });
  };

  Event.getEventStats = async function(childId, days = 7) {
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    return await this.findAll({
      attributes: [
        'event_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('DATE', sequelize.col('timestamp')), 'date']
      ],
      where: {
        child_id: childId,
        timestamp: {
          [sequelize.Op.gte]: startDate
        }
      },
      group: ['event_type', sequelize.fn('DATE', sequelize.col('timestamp'))],
      order: [['date', 'DESC']],
    });
  };

  // Hooks
  Event.addHook('beforeCreate', (event) => {
    event.setPriority();
    
    // Set device timestamp if not provided
    if (!event.device_timestamp) {
      event.device_timestamp = event.timestamp;
    }
  });

  return Event;
};

