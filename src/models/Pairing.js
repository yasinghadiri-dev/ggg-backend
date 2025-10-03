const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Pairing = sequelize.define('Pairing', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    child_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => uuidv4(),
      unique: true,
    },
    pairing_code: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    device_info: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'expired', 'cancelled'),
      defaultValue: 'pending',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'pairings'
  });

  // Instance methods
  Pairing.prototype.isExpired = function() {
    if (!this.expires_at) return false;
    return new Date() > new Date(this.expires_at);
  };

  Pairing.prototype.markExpired = async function() {
    this.status = 'expired';
    await this.save();
  };

  return Pairing;
};
