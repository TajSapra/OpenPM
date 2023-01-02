const tokens=require('../tokens/tokens')
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'OpenPM',
  password: tokens.postgrespassword,
  port: 5432,
})
module.exports = pool