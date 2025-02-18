import { Client } from 'pg';

async function query(queryObjects){
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
  });
  await client.connect();
  const result = await client.query(queryObjects);
  await client.end();
  return result;
}

export default {
  query: query,
};
