'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users').catch(() => null);
    
    if (table && !table.profile_image_url) {
      await queryInterface.addColumn('users', 'profile_image_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL to user profile image',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users').catch(() => null);
    
    if (table && table.profile_image_url) {
      await queryInterface.removeColumn('users', 'profile_image_url');
    }
  },
};
