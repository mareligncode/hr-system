'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      session_token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      device_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      device_type: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
        defaultValue: 'unknown'
      },
      browser_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      browser_version: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      os_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os_version: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_activity_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      terminated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('user_sessions', ['user_id']);
    await queryInterface.addIndex('user_sessions', ['session_token'], { unique: true });
    await queryInterface.addIndex('user_sessions', ['last_activity_at']);
    await queryInterface.addIndex('user_sessions', ['expires_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_sessions');
  }
};