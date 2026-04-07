'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('infoempresa', [
      {
        id_empresa: 1,
        nombre: 'Distribuidora La Ceiba',
        razon_social: 'Distribuidora La Ceiba, S. de R.L.',
        rtn: '08011999123456',
        direccion: 'Col. Palmira, Avenida Republica de Chile, Tegucigalpa, Francisco Morazan',
        telefono: '+504 2234-5600',
        correo: 'rrhh@dlc.hn',
        sitio_web: 'https://www.dlc.hn',
        codigo_moneda: 'HNL',
        tope_segurosocial_empleado: 11903.13,
        logo: null,
        logo_mime: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('infoempresa', { id_empresa: 1 }, {});
  }
};
