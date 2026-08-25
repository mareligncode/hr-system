'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('login_attempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      failure_reason: {
        type: Sequelize.ENUM(
          'user_not_found',
          'invalid_password',
          'account_locked',
          'account_inactive',
          'mfa_required',
          'mfa_failed'
        ),
        allowNull: true
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      attempted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('login_attempts', ['email']);
    await queryInterface.addIndex('login_attempts', ['user_id']);
    await queryInterface.addIndex('login_attempts', ['ip_address']);
    await queryInterface.addIndex('login_attempts', ['attempted_at']);
    await queryInterface.addIndex('login_attempts', ['email', 'attempted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('login_attempts');
  }
};