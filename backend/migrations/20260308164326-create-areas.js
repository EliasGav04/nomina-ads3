'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('areas', {
      id_area: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      area: { type: Sequelize.STRING(50), allowNull: false },
      estado: Sequelize.STRING(20),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('areas');
  }
};
