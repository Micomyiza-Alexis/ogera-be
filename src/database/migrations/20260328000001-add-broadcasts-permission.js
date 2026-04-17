'use strict';

const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if broadcasts permission already exists
    const [existingPermission] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE route = '/broadcasts' LIMIT 1`,
    );

    if (existingPermission.length > 0) {
      console.log('Broadcasts permission already exists, skipping...');
      return;
    }

    // Insert the broadcasts permission
    const permission = {
      id: randomUUID(),
      api_name: 'broadcasts',
      route: '/broadcasts',
      permission: JSON.stringify({
        view: true,
        create: true,
        edit: true,
        delete: true,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('permissions', [permission], {});

    console.log('Broadcasts permission created successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Delete the broadcasts permission
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE route = '/broadcasts'`,
    );
    console.log('Broadcasts permission removed successfully!');
  },
};
