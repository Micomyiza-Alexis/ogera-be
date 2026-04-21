'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users').catch(() => null);
    if (!table) return;

    if (!table.country_code) {
      await queryInterface.addColumn('users', 'country_code', {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('users').catch(() => null);
    if (!table) return;

    if (table.country_code) {
      await queryInterface.removeColumn('users', 'country_code');
    }
  },
};