'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('academic_records').catch(() => null);
    if (!table) return;

    if (table.class_level && !table.academic_profile) {
      await queryInterface.renameColumn('academic_records', 'class_level', 'academic_profile');
    }

    const latest = await queryInterface.describeTable('academic_records');

    if (!latest.class_name) {
      await queryInterface.addColumn('academic_records', 'class_name', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }
    if (!latest.board) {
      await queryInterface.addColumn('academic_records', 'board', {
        type: Sequelize.STRING(120),
        allowNull: true,
      });
    }
    if (!latest.degree) {
      await queryInterface.addColumn('academic_records', 'degree', {
        type: Sequelize.STRING(120),
        allowNull: true,
      });
    }
    if (!latest.university) {
      await queryInterface.addColumn('academic_records', 'university', {
        type: Sequelize.STRING(200),
        allowNull: true,
      });
    }
    if (latest.certificate && !latest.certificate_path) {
      await queryInterface.renameColumn('academic_records', 'certificate', 'certificate_path');
    } else if (!latest.certificate_path) {
      await queryInterface.addColumn('academic_records', 'certificate_path', {
        type: Sequelize.STRING(500),
        allowNull: true,
      });
    }
    if (!latest.storage_type) {
      await queryInterface.addColumn('academic_records', 'storage_type', {
        type: Sequelize.ENUM('local', 's3'),
        allowNull: true,
      });
    }

    // Map old values to new profile enum values.
    await queryInterface.sequelize.query(`
      UPDATE academic_records
      SET academic_profile =
        CASE
          WHEN academic_profile IN ('10', '12') THEN 'schooling'
          ELSE 'college'
        END
    `).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('academic_records').catch(() => null);
    if (!table) return;

    if (table.storage_type) {
      await queryInterface.removeColumn('academic_records', 'storage_type').catch(() => {});
    }
    if (table.university) {
      await queryInterface.removeColumn('academic_records', 'university').catch(() => {});
    }
    if (table.degree) {
      await queryInterface.removeColumn('academic_records', 'degree').catch(() => {});
    }
    if (table.board) {
      await queryInterface.removeColumn('academic_records', 'board').catch(() => {});
    }
    if (table.class_name) {
      await queryInterface.removeColumn('academic_records', 'class_name').catch(() => {});
    }
  },
};
