import { DB } from '@/database';
import { hash } from 'bcrypt';

const CATEGORIES = [
    {
        name: 'Development & IT',
        titles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Developer', 'Mobile App Developer', 'DevOps Engineer'],
    },
    {
        name: 'Design & Creative',
        titles: ['UI/UX Designer', 'Graphic Designer', 'Brand Designer', 'Motion Designer', 'Product Designer'],
    },
    {
        name: 'Finance & Accounting',
        titles: ['Junior Accountant', 'Bookkeeper', 'Financial Analyst', 'Tax Assistant', 'Audit Trainee'],
    },
    {
        name: 'Sales & Marketing',
        titles: ['Digital Marketer', 'Social Media Manager', 'Sales Associate', 'SEO Specialist', 'Content Strategist'],
    },
    {
        name: 'AI Services',
        titles: ['Machine Learning Engineer', 'Data Scientist', 'AI Research Assistant', 'NLP Engineer', 'Computer Vision Engineer'],
    },
    {
        name: 'Law',
        titles: ['Legal Researcher', 'Paralegal', 'Contract Reviewer', 'Compliance Assistant', 'Legal Writer'],
    },
    {
        name: 'HR & Training',
        titles: ['HR Assistant', 'Recruitment Specialist', 'Training Coordinator', 'Talent Acquisition Intern', 'HR Generalist'],
    },
    {
        name: 'Engineering & Architecture',
        titles: ['Civil Engineer', 'Mechanical Engineer Trainee', 'Architectural Drafter', 'CAD Designer', 'Structural Engineer'],
    },
    {
        name: 'Writing & Translation',
        titles: ['Content Writer', 'Copywriter', 'Translator', 'Technical Writer', 'Editor'],
    },
    {
        name: 'Admin & Support',
        titles: ['Virtual Assistant', 'Customer Support Agent', 'Data Entry Specialist', 'Office Coordinator', 'Receptionist'],
    },
];

const FIRST_NAMES = ['Aline', 'Eric', 'Diane', 'Jean', 'Marie', 'Patrick', 'Claire', 'Daniel', 'Grace', 'Samuel', 'Iris', 'Kevin', 'Linda', 'Michael', 'Nadia', 'Olivier', 'Pamela', 'Robert', 'Sandra', 'Thomas', 'Uwase', 'Victor', 'Winnie', 'Xavier', 'Yvonne', 'Zachary'];
const LAST_NAMES = ['Mugisha', 'Uwimana', 'Niyonzima', 'Ishimwe', 'Mukamana', 'Habimana', 'Nshimiyimana', 'Kayitesi', 'Mugabo', 'Tuyishime', 'Iradukunda', 'Bizimana', 'Hakizimana', 'Nyirahabimana'];
const LOCATIONS = ['Kigali, Rwanda', 'Nairobi, Kenya', 'Kampala, Uganda', 'Dar es Salaam, Tanzania', 'Addis Ababa, Ethiopia', 'Lagos, Nigeria'];

const SUMMARIES: Record<string, string> = {
    'Development & IT': 'Passionate developer with hands-on experience building modern web and mobile apps. Quick learner, comfortable with both frontend and backend stacks.',
    'Design & Creative': 'Creative designer focused on clean, user-centered design. Experienced in modern design tools and prototyping workflows.',
    'Finance & Accounting': 'Detail-oriented finance student with strong knowledge of accounting principles, Excel, and financial reporting.',
    'Sales & Marketing': 'Results-driven marketer with experience running social media campaigns and growing online communities.',
    'AI Services': 'Aspiring ML engineer with hands-on Python projects in NLP and computer vision. Strong math foundation.',
    'Law': 'Law student with experience in legal research, contract review, and case analysis.',
    'HR & Training': 'People-first HR student with strong communication skills and experience in recruitment coordination.',
    'Engineering & Architecture': 'Engineering student skilled in CAD tools, structural analysis, and project documentation.',
    'Writing & Translation': 'Versatile writer producing high-quality content across blogs, marketing, and technical docs.',
    'Admin & Support': 'Organized and reliable admin professional with strong communication and multitasking skills.',
};

const STUDENTS_PER_CATEGORY = 5; // 10 × 5 = 50 students

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

(async () => {
    try {
        const role = await DB.Roles.findOne({ where: { roleType: 'student' } });
        if (!role) {
            console.error('❌ No student role found. Cannot seed.');
            process.exit(1);
        }

        const passwordHash = await hash('Password@123', 10);
        let created = 0;
        let skipped = 0;

        for (const cat of CATEGORIES) {
            for (let i = 0; i < STUDENTS_PER_CATEGORY; i++) {
                const first = pick(FIRST_NAMES);
                const last = pick(LAST_NAMES);
                const fullName = `${first} ${last}`;
                const slug = `${first}.${last}`.toLowerCase();
                const suffix = Math.floor(Math.random() * 9000) + 1000;
                const email = `${slug}.${suffix}@demo.ogera.local`;
                const phone = `+25078${Math.floor(1000000 + Math.random() * 8999999)}`;

                const exists = await DB.Users.findOne({ where: { email } });
                if (exists) {
                    skipped++;
                    continue;
                }

                const user: any = await DB.Users.create({
                    full_name: fullName,
                    email,
                    mobile_number: phone,
                    password_hash: passwordHash,
                    role_id: role.id,
                    role_type: 'student',
                    email_verified: true,
                    phone_verified: true,
                    terms_accepted: true,
                    privacy_accepted: true,
                    terms_accepted_at: new Date(),
                    privacy_accepted_at: new Date(),
                    preferred_location: pick(LOCATIONS),
                } as any);

                await DB.UserSkills.create({
                    user_id: user.user_id,
                    skill_name: cat.name,
                    skill_type: 'key_skill',
                } as any);

                try {
                    await DB.UserExtendedProfiles.create({
                        user_id: user.user_id,
                        resume_headline: pick(cat.titles),
                        profile_summary: SUMMARIES[cat.name],
                        total_experience_years: Math.floor(Math.random() * 4),
                    } as any);
                } catch (e) {
                    // extended profile is optional
                }

                console.log(`  + ${fullName.padEnd(30)} ${cat.name}`);
                created++;
            }
        }

        console.log(`\n✅ Done. Created: ${created}, Skipped (already existed): ${skipped}`);
        console.log(`   All demo accounts use password: Password@123`);
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Error:', err?.message || err);
        console.error(err?.stack);
        process.exit(1);
    }
})();
