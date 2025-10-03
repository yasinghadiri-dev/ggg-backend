'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      name: { type: Sequelize.STRING, allowNull: false },
      profile_picture: { type: Sequelize.TEXT },
      language: { type: Sequelize.STRING, defaultValue: 'fa' },
      timezone: { type: Sequelize.STRING, defaultValue: 'Asia/Tehran' },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      verification_token: { type: Sequelize.STRING },
      reset_password_token: { type: Sequelize.STRING },
      reset_password_expires: { type: Sequelize.DATE },
      last_login: { type: Sequelize.DATE },
      fcm_token: { type: Sequelize.TEXT },
      settings: { type: Sequelize.JSON },
  status: { type: Sequelize.STRING, defaultValue: 'active' },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('children', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      parent_id: { type: Sequelize.UUID, allowNull: false },
      device_id: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      age: { type: Sequelize.INTEGER },
      profile_picture: { type: Sequelize.TEXT },
      emergency_contact: { type: Sequelize.STRING },
      monitoring_settings: { type: Sequelize.JSON },
      consent_data: { type: Sequelize.JSON },
      last_seen: { type: Sequelize.DATE },
      last_location: { type: Sequelize.JSON },
  connection_status: { type: Sequelize.STRING, defaultValue: 'offline' },
      app_version: { type: Sequelize.STRING },
  status: { type: Sequelize.STRING, defaultValue: 'active' },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('pairings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      child_id: { type: Sequelize.UUID, allowNull: true },
      parent_id: { type: Sequelize.UUID, allowNull: true },
      pairing_code: { type: Sequelize.STRING, allowNull: false },
      qr_code_data: { type: Sequelize.TEXT },
      device_info: { type: Sequelize.JSON },
  status: { type: Sequelize.STRING, defaultValue: 'pending' },
      expires_at: { type: Sequelize.DATE },
      session_id: { type: Sequelize.STRING },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      child_id: { type: Sequelize.UUID, allowNull: false },
      event_type: { type: Sequelize.STRING, allowNull: false },
      payload: { type: Sequelize.JSON },
      encrypted_payload: { type: Sequelize.TEXT },
      timestamp: { type: Sequelize.DATE, allowNull: false },
      device_timestamp: { type: Sequelize.DATE, allowNull: true },
      is_encrypted: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_processed: { type: Sequelize.BOOLEAN, defaultValue: false },
      processed_at: { type: Sequelize.DATE, allowNull: true },
      priority: { type: Sequelize.STRING, defaultValue: 'normal' },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('consent_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      parent_id: { type: Sequelize.UUID },
      child_id: { type: Sequelize.UUID },
      consent: { type: Sequelize.JSON },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('device_infos', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      child_id: { type: Sequelize.UUID },
      os: { type: Sequelize.STRING },
      os_version: { type: Sequelize.STRING },
      app_version: { type: Sequelize.STRING },
      last_seen: { type: Sequelize.DATE },
      metadata: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('device_infos');
    await queryInterface.dropTable('consent_logs');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('pairings');
    await queryInterface.dropTable('children');
    await queryInterface.dropTable('users');
  }
};
