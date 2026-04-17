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

    if (!(await tableExists('problem_metrics'))) {
      await queryInterface.createTable('problem_metrics', {
        problem_metric_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        title: { type: Sequelize.STRING(255), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        category: {
          type: Sequelize.ENUM('visual_puzzle', 'situational_puzzle', 'riddle', 'other'),
          allowNull: false,
          defaultValue: 'visual_puzzle',
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

    if (!(await tableExists('problem_metric_questions'))) {
      await queryInterface.createTable('problem_metric_questions', {
        question_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        problem_metric_id: {
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

    if ((await tableExists('problem_metrics')) && (await tableExists('users'))) {
      await safeAddConstraint(
        'problem_metrics',
        ['created_by'],
        'users',
        'user_id',
        'fk_problem_metrics_created_by_users',
        'CASCADE',
        'SET NULL',
      );
    }

    if ((await tableExists('problem_metric_questions')) && (await tableExists('problem_metrics'))) {
      await safeAddConstraint(
        'problem_metric_questions',
        ['problem_metric_id'],
        'problem_metrics',
        'problem_metric_id',
        'fk_problem_metric_questions_metric_id',
        'CASCADE',
        'CASCADE',
      );
    }

    const ut = await tableExists('user_tests');
    if (ut) {
      const desc = await queryInterface.describeTable('user_tests');
      if (!desc.problem_metric_id) {
        await queryInterface.addColumn('user_tests', 'problem_metric_id', {
          type: Sequelize.UUID,
          allowNull: true,
        });
      }
      if (await tableExists('problem_metrics')) {
        await safeAddConstraint(
          'user_tests',
          ['problem_metric_id'],
          'problem_metrics',
          'problem_metric_id',
          'fk_user_tests_problem_metric_id',
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
      await safeRemoveConstraint('user_tests', 'fk_user_tests_problem_metric_id');
      const desc = await queryInterface.describeTable('user_tests');
      if (desc.problem_metric_id) {
        await queryInterface.removeColumn('user_tests', 'problem_metric_id');
      }
    }
    if (await tableExists('problem_metric_questions')) {
      await safeRemoveConstraint('problem_metric_questions', 'fk_problem_metric_questions_metric_id');
      await queryInterface.dropTable('problem_metric_questions');
    }
    if (await tableExists('problem_metrics')) {
      await safeRemoveConstraint('problem_metrics', 'fk_problem_metrics_created_by_users');
      await queryInterface.dropTable('problem_metrics');
    }
  },
};
