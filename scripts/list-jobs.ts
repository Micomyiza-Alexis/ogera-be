import { DB } from '@/database';

(async () => {
  try {
    const jobs: any[] = await DB.Jobs.findAll({
      attributes: ['job_id', 'job_title', 'status', 'employer_id', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    console.log(`\n=== Found ${jobs.length} job(s) total ===\n`);

    const byStatus: Record<string, number> = {};
    for (const j of jobs) {
      byStatus[j.status] = (byStatus[j.status] || 0) + 1;
    }
    console.log('By status:', byStatus);
    console.log('');

    for (const j of jobs.slice(0, 20)) {
      console.log(`  [${j.status.padEnd(10)}] ${j.job_title}  (${j.job_id})`);
    }

    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
})();
