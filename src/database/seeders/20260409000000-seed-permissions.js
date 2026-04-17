const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if permissions already exist
      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM permissions;',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (existingPermissions[0].count > 0) {
        console.log('Permissions already exist. Skipping seeder...');
        return;
      }

      // Define all system routes with their permissions
      const permissions = [
        // Auth routes
        {
          id: uuidv4(),
          api_name: 'auth.login',
          route: '/auth/login',
          permission: JSON.stringify({ view: true, create: true, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'auth.register',
          route: '/auth/register',
          permission: JSON.stringify({ view: true, create: true, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'auth.refresh',
          route: '/auth/refresh-token',
          permission: JSON.stringify({ view: true, create: true, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'auth.logout',
          route: '/auth/logout',
          permission: JSON.stringify({ view: true, create: true, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Roles
        {
          id: uuidv4(),
          api_name: 'roles.list',
          route: '/roles',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'roles.get',
          route: '/roles/:id',
          permission: JSON.stringify({ view: true, create: false, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Permissions
        {
          id: uuidv4(),
          api_name: 'permissions.list',
          route: '/permissions',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'permissions.get',
          route: '/permissions/:id',
          permission: JSON.stringify({ view: true, create: false, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Jobs
        {
          id: uuidv4(),
          api_name: 'jobs.list',
          route: '/jobs',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          api_name: 'jobs.get',
          route: '/jobs/:id',
          permission: JSON.stringify({ view: true, create: false, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Job Categories
        {
          id: uuidv4(),
          api_name: 'job-categories.list',
          route: '/job-categories',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Job Applications
        {
          id: uuidv4(),
          api_name: 'job-applications.list',
          route: '/job-applications',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Academic Verifications
        {
          id: uuidv4(),
          api_name: 'academic-verifications.list',
          route: '/academic-verifications',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Notifications
        {
          id: uuidv4(),
          api_name: 'notifications.list',
          route: '/notifications',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Trust Score
        {
          id: uuidv4(),
          api_name: 'trust-score.list',
          route: '/trust-score',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Profile
        {
          id: uuidv4(),
          api_name: 'profile.view',
          route: '/profile',
          permission: JSON.stringify({ view: true, create: false, edit: true, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Users
        {
          id: uuidv4(),
          api_name: 'users.list',
          route: '/users',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Courses
        {
          id: uuidv4(),
          api_name: 'courses.list',
          route: '/courses',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Disputes
        {
          id: uuidv4(),
          api_name: 'disputes.list',
          route: '/disputes',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Dashboard
        {
          id: uuidv4(),
          api_name: 'dashboard.view',
          route: '/dashboard',
          permission: JSON.stringify({ view: true, create: false, edit: false, delete: false }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Payments (Pesapal)
        {
          id: uuidv4(),
          api_name: 'payments.pesapal',
          route: '/payments',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Mobile Money (Momo)
        {
          id: uuidv4(),
          api_name: 'payments.momo',
          route: '/momo',
          permission: JSON.stringify({ view: true, create: true, edit: true, delete: true }),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('permissions', permissions);
      console.log('✅ Permissions seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding permissions:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('permissions', null, {});
      console.log('✅ Permissions unseeded successfully');
    } catch (error) {
      console.error('❌ Error unseeding permissions:', error);
      throw error;
    }
  },
};

