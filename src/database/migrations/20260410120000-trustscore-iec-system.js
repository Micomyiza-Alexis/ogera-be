'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable('users').catch(() => null);
    if (users) {
      const addFloat = async (col) => {
        if (!users[col]) {
          await queryInterface.addColumn('users', col, {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null,
          });
        }
      };
      await addFloat('intelligence_score');
      await addFloat('experience_score');
      await addFloat('interaction_score');
      await addFloat('trust_score');
      if (!users.trust_level) {
        await queryInterface.addColumn('users', 'trust_level', {
          type: Sequelize.STRING(32),
          allowNull: true,
          defaultValue: null,
        });
      }
    }

    const tableExists = async (name) => {
      try {
        await queryInterface.describeTable(name);
        return true;
      } catch {
        return false;
      }
    };

    if (!(await tableExists('user_tests'))) {
      await queryInterface.createTable('user_tests', {
        test_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'user_id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        test_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        score: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
        },
        max_score: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 1,
        },
        taken_at: {
          type: Sequelize.DATE,
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
      await queryInterface.addIndex('user_tests', ['user_id']);
    }

    if (!(await tableExists('user_feedback'))) {
      await queryInterface.createTable('user_feedback', {
        feedback_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          comment: 'Student (subject) receiving the rating',
          references: { model: 'users', key: 'user_id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        rater_user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'user_id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        rating: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        comment: {
          type: Sequelize.TEXT,
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
      await queryInterface.addIndex('user_feedback', ['user_id']);
    }

    if (!(await tableExists('trustscore_history'))) {
      await queryInterface.createTable('trustscore_history', {
        history_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'user_id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        intelligence_score: { type: Sequelize.FLOAT, allowNull: true },
        experience_score: { type: Sequelize.FLOAT, allowNull: true },
        interaction_score: { type: Sequelize.FLOAT, allowNull: true },
        trust_score: { type: Sequelize.FLOAT, allowNull: true },
        trust_level: { type: Sequelize.STRING(32), allowNull: true },
        computed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
      await queryInterface.addIndex('trustscore_history', ['user_id']);
      await queryInterface.addIndex('trustscore_history', ['computed_at']);
    }
  },

  async down(queryInterface, Sequelize) {
    for (const t of ['trustscore_history', 'user_feedback', 'user_tests']) {
      try {
        await queryInterface.dropTable(t);
      } catch {
        /* ignore */
      }
    }

    const users = await queryInterface.describeTable('users').catch(() => null);
    if (users) {
      for (const col of [
        'trust_level',
        'trust_score',
        'interaction_score',
        'experience_score',
        'intelligence_score',
      ]) {
        if (users[col]) {
          await queryInterface.removeColumn('users', col);
        }
      }
    }
  },
};
