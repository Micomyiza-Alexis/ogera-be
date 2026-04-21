'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('jobs');
    if (!tableDefinition.currency) {
      await queryInterface.addColumn('jobs', 'currency', {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USD',
      });
    }
  },

  async down(queryInterface) {
    const tableDefinition = await queryInterface.describeTable('jobs');
    if (tableDefinition.currency) {
      await queryInterface.removeColumn('jobs', 'currency');
    }
  },
};
