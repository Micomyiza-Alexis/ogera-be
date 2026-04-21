'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    if (!table.website_url) {
      await queryInterface.addColumn('user_extended_profiles', 'website_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.linkedin_url) {
      await queryInterface.addColumn('user_extended_profiles', 'linkedin_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    if (table.linkedin_url) {
      await queryInterface.removeColumn('user_extended_profiles', 'linkedin_url');
    }
    if (table.website_url) {
      await queryInterface.removeColumn('user_extended_profiles', 'website_url');
    }
  },
};
