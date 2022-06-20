'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.TEXT,

      },
      description: {
        type: Sequelize.TEXT,
      },
      logo: {
        type: Sequelize.STRING,
      },
      maintenance: {
        type: Sequelize.STRING,
        defaultValue: 'off'
      },
      notification: {
        type: Sequelize.TEXT
      },
      minPlay: {
        type: Sequelize.INTEGER,
        defaultValue: 5000
      },
      maxPlay: {
        type: Sequelize.INTEGER,
        defaultValue: 100000
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};