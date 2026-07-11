const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:dev.db' });
async function fix() {
  await client.execute({
    sql: 'UPDATE User SET password = ? WHERE email = ?',
    args: ['$2b$10$AbmmVaUGf4NgIfYLdBnFw.86xAW06B2ksXiWEudkQW4mn2vhessu.', 'admin@test.com']
  });
  console.log('Fixed password');
}
fix().catch(console.error);
