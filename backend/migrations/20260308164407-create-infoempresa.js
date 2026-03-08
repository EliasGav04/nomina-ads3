'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('infoempresa', {
      id_empresa: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: Sequelize.STRING(100),
      razon_social: Sequelize.STRING(150),
      rtn: Sequelize.STRING(20),
      direccion: Sequelize.STRING(250),
      telefono: Sequelize.STRING(20),
      correo: Sequelize.STRING(150),
      sitio_web: Sequelize.STRING(150),
      logo: Sequelize.BLOB('medium'),
      logo_mime: Sequelize.STRING(50),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable('infoempresa');
  }
};
