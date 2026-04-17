'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const exists = await queryInterface.describeTable('academic_records').then(() => true).catch(() => false);
    if (exists) return;

    await queryInterface.createTable('academic_records', {
      record_id: {
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
      academic_profile: {
        type: Sequelize.ENUM('schooling', 'college'),
        allowNull: false,
      },
      class_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      board: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      degree: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      university: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      grade: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      certificate_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      storage_type: {
        type: Sequelize.ENUM('local', 's3'),
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

    await queryInterface.addIndex('academic_records', ['user_id']);
    await queryInterface.addIndex('academic_records', ['academic_profile']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('academic_records').catch(() => {});
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_academic_records_academic_profile";').catch(() => {});
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_academic_records_storage_type";').catch(() => {});
    }
  },
};
