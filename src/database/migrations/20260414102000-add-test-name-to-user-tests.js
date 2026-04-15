'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = async (name) => {
      try {
        await queryInterface.describeTable(name);
        return true;
      } catch {
        return false;
      }
    };

    if (!(await tableExists('user_tests'))) return;

    const desc = await queryInterface.describeTable('user_tests');
    if (!desc.test_name) {
      await queryInterface.addColumn('user_tests', 'test_name', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableExists = async (name) => {
      try {
        await queryInterface.describeTable(name);
        return true;
      } catch {
        return false;
      }
    };

    if (!(await tableExists('user_tests'))) return;

    const desc = await queryInterface.describeTable('user_tests');
    if (desc.test_name) {
      await queryInterface.removeColumn('user_tests', 'test_name');
    }
  },
};
