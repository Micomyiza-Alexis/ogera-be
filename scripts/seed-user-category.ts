import { DB } from '@/database';

const EMAIL = 'testing.student1@gmail.com';
const CATEGORY = 'Development & IT';

(async () => {
    try {
        const user = await DB.Users.findOne({ where: { email: EMAIL } });
        if (!user) {
            console.error(`❌ No user found with email ${EMAIL}`);
            process.exit(1);
        }

        const existing = await DB.UserSkills.findOne({
            where: { user_id: user.user_id, skill_name: CATEGORY },
        });
        if (existing) {
            console.log(`✅ Skill "${CATEGORY}" already exists for ${EMAIL}`);
            process.exit(0);
        }

        await DB.UserSkills.create({
            user_id: user.user_id,
            skill_name: CATEGORY,
            skill_type: 'key_skill',
        } as any);

        console.log(`✅ Added "${CATEGORY}" to ${EMAIL} (user_id: ${user.user_id})`);
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Error:', err?.message || err);
        process.exit(1);
    }
})();
