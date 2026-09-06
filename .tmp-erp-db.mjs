import pg from 'pg';
import fs from 'node:fs/promises';

const { Client } = pg;
const [mode, sqlFile] = process.argv.slice(2);
const client = new Client({
  host: 'aws-0-ap-southeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.pylujhitarwpqufnhbml',
  password: process.env.ESSA_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
try {
  if (mode === 'apply') {
    const sql = await fs.readFile(sqlFile, 'utf8');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('commit');
      console.log('MIGRATION_APPLIED');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }

  const { rows } = await client.query(`
    select
      (select count(*)::int from auth.users) as auth_users,
      (select count(*)::int from public.admin_users) as admin_users,
      (select count(*)::int from public.quotes) as quotes,
      (select data_type from information_schema.columns where table_schema='public' and table_name='quotes' and column_name='id') as quote_id_type,
      (select count(*)::int from information_schema.tables where table_schema='public' and table_name in ('customers','inquiries','orders','payments','products','site_content')) as erp_tables
  `);
  console.log(JSON.stringify(rows[0]));
} finally {
  await client.end();
}
