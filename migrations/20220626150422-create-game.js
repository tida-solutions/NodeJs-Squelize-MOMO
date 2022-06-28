'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      chanle: {
        type: Sequelize.STRING
      },
      chanle: {
        type: Sequelize.STRING
      },
      taixiu: {
        type: Sequelize.STRING
      },
      chanle2: {
        type: Sequelize.STRING
      },
      gap3: {
        type: Sequelize.STRING
      },
      tong3so: {
        type: Sequelize.STRING
      },
      motphan3: {
        type: Sequelize.STRING
      },
      xien: {
        type: Sequelize.STRING
      },
      doanso: {
        type: Sequelize.STRING
      },
      amduong: {
        type: Sequelize.STRING
      },
      lien: {
        type: Sequelize.STRING
      },
      motdoi: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Games');
  }
};