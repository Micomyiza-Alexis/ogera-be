"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create conversations table
    await queryInterface.createTable("conversations", {
      conversation_id: {
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
      employer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      last_message_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add unique constraint for conversations
    await queryInterface.addConstraint("conversations", {
      fields: ["employer_id", "student_id", "job_id"],
      type: "unique",
      name: "unique_conversation_per_job_employer_student",
    });

    // Create indexes for conversations
    await queryInterface.addIndex("conversations", ["employer_id"], {
      name: "idx_conversations_employer_id",
    });

    await queryInterface.addIndex("conversations", ["student_id"], {
      name: "idx_conversations_student_id",
    });

    await queryInterface.addIndex("conversations", ["job_id"], {
      name: "idx_conversations_job_id",
    });

    await queryInterface.addIndex("conversations", ["last_message_at"], {
      name: "idx_conversations_last_message_at",
    });

    // Create messages table
    await queryInterface.createTable("messages", {
      message_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "conversations",
          key: "conversation_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      receiver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      read_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Create indexes for messages for optimal query performance
    await queryInterface.addIndex("messages", ["conversation_id"], {
      name: "idx_messages_conversation_id",
    });

    await queryInterface.addIndex("messages", ["sender_id"], {
      name: "idx_messages_sender_id",
    });

    await queryInterface.addIndex("messages", ["receiver_id"], {
      name: "idx_messages_receiver_id",
    });

    await queryInterface.addIndex("messages", ["created_at"], {
      name: "idx_messages_created_at",
    });

    // Composite index for efficient conversation + read_status queries
    await queryInterface.addIndex(
      "messages",
      ["conversation_id", "read_status"],
      {
        name: "idx_messages_conversation_read_status",
      }
    );

    // Composite index for efficient message fetching by conversation and timestamp
    await queryInterface.addIndex(
      "messages",
      ["conversation_id", "created_at"],
      {
        name: "idx_messages_conversation_created_at",
      }
    );
  },

  async down(queryInterface) {
    // Drop messages table first (due to foreign key constraint)
    await queryInterface.dropTable("messages");

    // Then drop conversations table
    await queryInterface.dropTable("conversations");
  },
};
