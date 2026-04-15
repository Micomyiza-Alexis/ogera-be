import { DB } from '@/database';
import { Op } from 'sequelize';

(async () => {
    try {
        const demoStudents = await DB.Users.findAll({
            where: {
                role_type: 'student',
                email: { [Op.like]: '%@demo.ogera.local' },
            },
            attributes: ['user_id', 'email'],
        });

        console.log(`Found ${demoStudents.length} demo students to delete`);

        for (const s of demoStudents as any[]) {
            await DB.UserSkills.destroy({ where: { user_id: s.user_id } });
            await DB.UserExtendedProfiles.destroy({ where: { user_id: s.user_id } }).catch(() => {});
            await DB.Users.destroy({ where: { user_id: s.user_id } });
            console.log(`  - deleted ${s.email}`);
        }

        console.log(`\n✅ Deleted ${demoStudents.length} demo students`);
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Error:', err?.message || err);
        process.exit(1);
    }
})();
