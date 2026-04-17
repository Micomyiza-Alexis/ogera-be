"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      task_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "jobs",
          key: "job_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      assigned_student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "NOT_STARTED",
          "IN_PROGRESS",
          "SUBMITTED",
          "UNDER_REVIEW",
          "COMPLETED",
          "REJECTED",
          "DISPUTED",
        ),
        allowNull: false,
        defaultValue: "NOT_STARTED",
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payment_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tasks");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status";');
  },
};
