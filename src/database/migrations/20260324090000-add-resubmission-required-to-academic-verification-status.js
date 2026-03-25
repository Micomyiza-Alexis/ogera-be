'use strict';

/**
 * Adds `resubmission_required` to academic_verifications.status enum
 * Supports both PostgreSQL and MySQL.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'enum_academic_verifications_status'
              AND e.enumlabel = 'resubmission_required'
          ) THEN
            ALTER TYPE "enum_academic_verifications_status" ADD VALUE 'resubmission_required';
          END IF;
        END
        $$;
      `);
      return;
    }

    if (dialect === 'mysql' || dialect === 'mariadb') {
      await queryInterface.changeColumn('academic_verifications', 'status', {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'resubmission_required'),
        allowNull: false,
        defaultValue: 'pending',
      });
    }
  },

  async down() {
    // No safe down migration for enum value removal in PostgreSQL.
  },
};

