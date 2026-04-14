module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if table already exists
      const tableExists = await queryInterface.describeTable('sessions').catch(() => null);
      
      if (tableExists) {
        console.log('Sessions table already exists, skipping...');
        return;
      }

      await queryInterface.createTable('sessions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'user_id',
          },
          onDelete: 'CASCADE',
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        device_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'Desktop',
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        last_activity: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      // Create indexes for performance
      await queryInterface.addIndex('sessions', ['user_id']);
      await queryInterface.addIndex('sessions', ['token']);
      await queryInterface.addIndex('sessions', ['expires_at']);

      console.log('✅ Sessions table created successfully');
    } catch (error) {
      console.error('❌ Error creating sessions table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('sessions');
      console.log('✅ Sessions table dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping sessions table:', error);
      throw error;
    }
  },
};
