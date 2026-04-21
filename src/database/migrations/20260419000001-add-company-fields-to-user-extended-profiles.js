'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    if (!table.company_name) {
      await queryInterface.addColumn('user_extended_profiles', 'company_name', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.industry_category) {
      await queryInterface.addColumn('user_extended_profiles', 'industry_category', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.company_size) {
      await queryInterface.addColumn('user_extended_profiles', 'company_size', {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.company_location) {
      await queryInterface.addColumn('user_extended_profiles', 'company_location', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    if (table.company_location) {
      await queryInterface.removeColumn('user_extended_profiles', 'company_location');
    }
    if (table.company_size) {
      await queryInterface.removeColumn('user_extended_profiles', 'company_size');
    }
    if (table.industry_category) {
      await queryInterface.removeColumn('user_extended_profiles', 'industry_category');
    }
    if (table.company_name) {
      await queryInterface.removeColumn('user_extended_profiles', 'company_name');
    }
  },
};