'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('messages', 'file_url', {
      type: Sequelize.TEXT,
      nullable: true,
      comment: 'URL of uploaded file',
    });

    await queryInterface.addColumn('messages', 'file_name', {
      type: Sequelize.STRING,
      nullable: true,
      comment: 'Original name of uploaded file',
    });

    await queryInterface.addColumn('messages', 'file_type', {
      type: Sequelize.STRING,
      nullable: true,
      comment: 'MIME type of file (e.g., application/pdf, image/png)',
    });

    // Add index for file_url for faster lookups
    await queryInterface.addIndex('messages', ['file_url']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('messages', ['file_url']);
    await queryInterface.removeColumn('messages', 'file_type');
    await queryInterface.removeColumn('messages', 'file_name');
    await queryInterface.removeColumn('messages', 'file_url');
  },
};
