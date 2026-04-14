'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('messages', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Message text content (nullable if file is provided)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('messages', 'content', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
