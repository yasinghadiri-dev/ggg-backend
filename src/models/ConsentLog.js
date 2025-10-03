const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConsentLog = sequelize.define('ConsentLog', {
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
    consent_action: {
      type: DataTypes.ENUM('grant', 'revoke'),
      allowNull: false,
    },
    consent_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'consent_logs'
  });

  return ConsentLog;
};
