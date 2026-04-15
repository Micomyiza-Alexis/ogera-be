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

    const safeAddConstraint = async (
      tableName,
      fields,
      referenceTable,
      referenceField,
      name,
      onUpdate = 'CASCADE',
      onDelete = 'SET NULL',
    ) => {
      try {
        await queryInterface.addConstraint(tableName, {
          fields,
          type: 'foreign key',
          name,
          references: {
            table: referenceTable,
            field: referenceField,
          },
          onUpdate,
          onDelete,
        });
      } catch (error) {
        const msg = String(error?.message || '').toLowerCase();
        // Keep migration resilient across partially-applied states and differing DB engines.
        if (
          msg.includes('already exists') ||
          msg.includes('duplicate') ||
          msg.includes('unknown constraint') ||
          msg.includes('does not exist')
        ) {
          return;
        }
        throw error;
      }
    };

    if (!(await tableExists('cognitive_tests'))) {
      await queryInterface.createTable('cognitive_tests', {
        cognitive_test_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        title: { type: Sequelize.STRING(255), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        category: {
          type: Sequelize.ENUM('numerical', 'verbal', 'logical', 'mixed'),
          allowNull: false,
          defaultValue: 'numerical',
        },
        published: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    if (!(await tableExists('cognitive_questions'))) {
      await queryInterface.createTable('cognitive_questions', {
        question_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        cognitive_test_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        prompt: { type: Sequelize.TEXT, allowNull: false },
        option_a: { type: Sequelize.TEXT, allowNull: false },
        option_b: { type: Sequelize.TEXT, allowNull: false },
        option_c: { type: Sequelize.TEXT, allowNull: false },
        option_d: { type: Sequelize.TEXT, allowNull: false },
        correct_index: { type: Sequelize.INTEGER, allowNull: false },
        difficulty: {
          type: Sequelize.ENUM('easy', 'medium', 'hard'),
          allowNull: false,
          defaultValue: 'medium',
        },
        sort_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    // Add FK constraints separately and safely to avoid migration crashes
    // from pre-existing / partially-applied constraints.
    if ((await tableExists('cognitive_tests')) && (await tableExists('users'))) {
      await safeAddConstraint(
        'cognitive_tests',
        ['created_by'],
        'users',
        'user_id',
        'fk_cognitive_tests_created_by_users',
        'CASCADE',
        'SET NULL',
      );
    }

    if ((await tableExists('cognitive_questions')) && (await tableExists('cognitive_tests'))) {
      await safeAddConstraint(
        'cognitive_questions',
        ['cognitive_test_id'],
        'cognitive_tests',
        'cognitive_test_id',
        'fk_cognitive_questions_test_id',
        'CASCADE',
        'CASCADE',
      );
    }

    const ut = await tableExists('user_tests');
    if (ut) {
      const desc = await queryInterface.describeTable('user_tests');
      if (!desc.cognitive_test_id) {
        await queryInterface.addColumn('user_tests', 'cognitive_test_id', {
          type: Sequelize.UUID,
          allowNull: true,
        });
      }
      if (await tableExists('cognitive_tests')) {
        await safeAddConstraint(
          'user_tests',
          ['cognitive_test_id'],
          'cognitive_tests',
          'cognitive_test_id',
          'fk_user_tests_cognitive_test_id',
          'CASCADE',
          'SET NULL',
        );
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
    const safeRemoveConstraint = async (tableName, constraintName) => {
      try {
        await queryInterface.removeConstraint(tableName, constraintName);
      } catch (error) {
        const msg = String(error?.message || '').toLowerCase();
        if (
          msg.includes('unknown constraint') ||
          msg.includes('does not exist') ||
          msg.includes('cannot drop') ||
          msg.includes('not found')
        ) {
          return;
        }
        throw error;
      }
    };
    if (await tableExists('user_tests')) {
      await safeRemoveConstraint('user_tests', 'fk_user_tests_cognitive_test_id');
      const desc = await queryInterface.describeTable('user_tests');
      if (desc.cognitive_test_id) {
        await queryInterface.removeColumn('user_tests', 'cognitive_test_id');
      }
    }
    if (await tableExists('cognitive_questions')) {
      await safeRemoveConstraint('cognitive_questions', 'fk_cognitive_questions_test_id');
      await queryInterface.dropTable('cognitive_questions');
    }
    if (await tableExists('cognitive_tests')) {
      await safeRemoveConstraint('cognitive_tests', 'fk_cognitive_tests_created_by_users');
      await queryInterface.dropTable('cognitive_tests');
    }
  },
};
