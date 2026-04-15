import { DB } from '@/database';

const CATEGORIES = [
  { name: 'Development & IT',          icon: '💻', description: 'Software, web, mobile, DevOps' },
  { name: 'Design & Creative',         icon: '🎨', description: 'UI/UX, graphic, branding, motion' },
  { name: 'Finance & Accounting',      icon: '💰', description: 'Bookkeeping, audit, financial analysis' },
  { name: 'Sales & Marketing',         icon: '📈', description: 'Digital marketing, sales, growth, SEO' },
  { name: 'AI Services',               icon: '🤖', description: 'Machine learning, NLP, data science' },
  { name: 'Law',                       icon: '⚖️', description: 'Legal research, contracts, compliance' },
  { name: 'HR & Training',             icon: '👥', description: 'Recruitment, training, talent' },
  { name: 'Engineering & Architecture',icon: '🏗️', description: 'Civil, mechanical, CAD, structural' },
  { name: 'Writing & Translation',     icon: '✍️', description: 'Content, copywriting, translation' },
  { name: 'Admin & Support',           icon: '📋', description: 'Virtual assistance, data entry, customer service' },
];

(async () => {
  try {
    // 1. Wipe everything currently in job_categories so we start clean
    const before = await DB.JobCategories.count();
    await DB.JobCategories.destroy({ where: {}, truncate: false });
    console.log(`Removed ${before} existing categories`);

    // 2. Insert the canonical 10
    for (const cat of CATEGORIES) {
      await DB.JobCategories.create(cat as any);
      console.log(`  + ${cat.name}`);
    }

    console.log(`\n✅ Seeded ${CATEGORIES.length} canonical job categories`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
})();
