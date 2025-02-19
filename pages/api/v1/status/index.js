import database from 'infra/database.js';

async function status(req, res) {
  const result = await database.query('SELECT NOW();');
  console.log(result.rows[0]);
  return res.status(200).json({msg:'OK'});
}

export default status;
