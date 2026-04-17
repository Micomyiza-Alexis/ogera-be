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

    if (!(await tableExists('trustscore_history'))) return;

    const desc = await queryInterface.describeTable('trustscore_history');
    if (!desc.computed_at) {
      await queryInterface.addColumn('trustscore_history', 'computed_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }

    // Add index if missing (safe: ignore duplicate/index-exists errors)
    try {
      await queryInterface.addIndex('trustscore_history', ['computed_at'], {
        name: 'trustscore_history_computed_at_idx',
      });
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      if (!msg.includes('already exists') && !msg.includes('duplicate')) {
        throw error;
      }
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

    if (!(await tableExists('trustscore_history'))) return;

    try {
      await queryInterface.removeIndex('trustscore_history', 'trustscore_history_computed_at_idx');
    } catch {
      // ignore
    }

    const desc = await queryInterface.describeTable('trustscore_history');
    if (desc.computed_at) {
      await queryInterface.removeColumn('trustscore_history', 'computed_at');
    }
  },
};
