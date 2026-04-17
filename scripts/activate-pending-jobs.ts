import { DB } from '@/database';

(async () => {
  try {
    const [updated] = await DB.Jobs.update(
      { status: 'Active' } as any,
      { where: { status: 'Pending' } },
    );
    console.log(`✅ Activated ${updated} previously-Pending job(s)`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
})();
