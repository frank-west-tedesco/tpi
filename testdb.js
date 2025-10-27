const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cpeg',
  port: 3307
};

(async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión MySQL exitosa');
    await connection.end();
  } catch (err) {
    console.error('Error conectando a MySQL:', err.message);
  }
})();