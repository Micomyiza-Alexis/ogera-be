'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    const userIdColumn = table.user_id;
    if (!userIdColumn) return;

    if (!userIdColumn.primaryKey && !userIdColumn.unique) {
      await queryInterface.addConstraint('user_extended_profiles', {
        fields: ['user_id'],
        type: 'unique',
        name: 'user_extended_profiles_user_id_unique',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('user_extended_profiles').catch(() => null);
    if (!table) return;

    const userIdColumn = table.user_id;
    if (userIdColumn && !userIdColumn.primaryKey && userIdColumn.unique) {
      await queryInterface.removeConstraint('user_extended_profiles', 'user_extended_profiles_user_id_unique');
    }
  },
};