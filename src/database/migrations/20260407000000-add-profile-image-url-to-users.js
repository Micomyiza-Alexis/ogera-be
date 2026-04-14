'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('users');
    if (!tableInfo.profile_image_url) {
      await queryInterface.addColumn('users', 'profile_image_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'profile_image_url');
  },
};
