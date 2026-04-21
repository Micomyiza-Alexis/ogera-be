'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('messages');

    if (!tableDefinition.file_url) {
      await queryInterface.addColumn('messages', 'file_url', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL of uploaded file',
      });
    }

    if (!tableDefinition.file_name) {
      await queryInterface.addColumn('messages', 'file_name', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Original name of uploaded file',
      });
    }

    if (!tableDefinition.file_type) {
      await queryInterface.addColumn('messages', 'file_type', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'MIME type of file (e.g., application/pdf, image/png)',
      });
    }

    const indexes = await queryInterface.showIndex('messages');
    const hasFileUrlIndex = indexes.some((index) =>
      index.fields?.some((field) => field.attribute === 'file_url'),
    );

    if (!hasFileUrlIndex) {
      // Add index for file_url for faster lookups
      await queryInterface.addIndex('messages', ['file_url']);
    }
  },

  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('messages');
    const indexes = await queryInterface.showIndex('messages');
    const fileUrlIndex = indexes.find((index) =>
      index.fields?.some((field) => field.attribute === 'file_url'),
    );

    if (fileUrlIndex?.name) {
      await queryInterface.removeIndex('messages', fileUrlIndex.name);
    }

    if (tableDefinition.file_type) {
      await queryInterface.removeColumn('messages', 'file_type');
    }
    if (tableDefinition.file_name) {
      await queryInterface.removeColumn('messages', 'file_name');
    }
    if (tableDefinition.file_url) {
      await queryInterface.removeColumn('messages', 'file_url');
    }
  },
};
