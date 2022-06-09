'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Phones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING
      },
      countSendDay: {
        type: Sequelize.STRING
      },
      countReceiveDay: {
        type: Sequelize.STRING
      },
      totalSendDay: {
        type: Sequelize.STRING
      },
      totalReceiveDay: {
        type: Sequelize.STRING
      },
      totalSendMonth: {
        type: Sequelize.STRING
      },
      totalReceiveMonth: {
        type: Sequelize.STRING
      },
      isShow: {
        type: Sequelize.STRING,
        defaultValue: true
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
    await queryInterface.dropTable('Phones');
  }
};