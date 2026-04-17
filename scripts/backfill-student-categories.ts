import { DB } from '@/database';

const CATEGORIES = [
    'Development & IT',
    'Design & Creative',
    'Finance & Accounting',
    'Sales & Marketing',
    'AI Services',
    'Law',
    'HR & Training',
    'Engineering & Architecture',
    'Writing & Translation',
    'Admin & Support',
];

(async () => {
    try {
        const students = await DB.Users.findAll({
            where: { role_type: 'student' },
            attributes: ['user_id', 'email'],
        });

        console.log(`Found ${students.length} students total`);

        let added = 0;
        let skipped = 0;

        for (let i = 0; i < students.length; i++) {
            const s: any = students[i];
            const has = await DB.UserSkills.findOne({
                where: { user_id: s.user_id },
            });
            if (has) {
                skipped++;
                continue;
            }

            // Round-robin so every category gets coverage
            const category = CATEGORIES[i % CATEGORIES.length];
            await DB.UserSkills.create({
                user_id: s.user_id,
                skill_name: category,
                skill_type: 'key_skill',
            } as any);
            console.log(`  + ${s.email} → ${category}`);
            added++;
        }

        console.log(`\n✅ Done. Added: ${added}, Skipped (already had skills): ${skipped}`);
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Error:', err?.message || err);
        process.exit(1);
    }
})();
