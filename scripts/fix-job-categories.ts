import { DB } from '@/database';

const CANONICAL = [
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

// Heuristic: guess a category from the job title
const guessCategory = (title: string): string => {
  const t = title.toLowerCase();
  if (/front|back|full|web|mobile|developer|engineer|software|js|react|node|python|java|php|api/.test(t)) return 'Development & IT';
  if (/design|ui|ux|figma|graphic|brand|illustrator|photoshop/.test(t)) return 'Design & Creative';
  if (/account|finance|book|audit|tax|excel/.test(t)) return 'Finance & Accounting';
  if (/sales|market|seo|social|content|growth|advertis/.test(t)) return 'Sales & Marketing';
  if (/ai|machine learning|ml|nlp|data scien|tensorflow|pytorch/.test(t)) return 'AI Services';
  if (/law|legal|contract|compliance|attorney|paralegal/.test(t)) return 'Law';
  if (/hr|human resource|recruit|talent|training/.test(t)) return 'HR & Training';
  if (/engineer|architect|cad|civil|mechanical|electrical/.test(t)) return 'Engineering & Architecture';
  if (/writ|copy|translat|editor|proofread/.test(t)) return 'Writing & Translation';
  if (/admin|assistant|data entry|support|reception|office/.test(t)) return 'Admin & Support';
  return 'Development & IT'; // sensible default
};

(async () => {
  try {
    const jobs: any[] = await DB.Jobs.findAll({
      attributes: ['job_id', 'job_title', 'category'],
    });

    let fixed = 0;
    let ok = 0;

    for (const j of jobs) {
      if (CANONICAL.includes(j.category)) {
        ok++;
        continue;
      }
      const newCat = guessCategory(j.job_title || '');
      await DB.Jobs.update(
        { category: newCat } as any,
        { where: { job_id: j.job_id } }
      );
      console.log(`  ${j.job_title}: "${j.category}" → "${newCat}"`);
      fixed++;
    }

    console.log(`\n✅ Fixed: ${fixed}, Already valid: ${ok}, Total: ${jobs.length}`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
})();
