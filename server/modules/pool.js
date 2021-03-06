const pg = require('pg');
const url = require('url');

let config = {};

if (process.env.DATABASE_URL) {
  // Heroku gives a url, not a connection object
  // https://github.com/brianc/node-pg-pool
  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true, // heroku requires ssl to be true
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };
} else if (process.env.POSTGRES_USER) {
  // config for docker env
  config = {
    host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : 'localhost', // Server hosting the postgres database
    user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'postgres',
    password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : 'postgres',
    port: process.env.PORT_DB ? process.env.PORT_DB : 5432, // env var: PGPORT
    database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'employee_portal', // env var: PGDATABASE
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };
} else {
  // config for local env
  config = {
    database: 'employee_portal'
  }
}

// this creates the pool that will be shared by all other modules
const pool = new pg.Pool(config);

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err) => {
  console.log('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
