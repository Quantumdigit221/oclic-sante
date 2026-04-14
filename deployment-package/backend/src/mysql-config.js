import mysql from 'mysql2/promise';

// Configuration MySQL pour Hostinger
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sante_saas',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer le pool de connexions
const pool = mysql.createPool(mysqlConfig);

export default pool;
