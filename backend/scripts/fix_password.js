import mysql from 'mysql2/promise';

async function fixPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'sante_saas'
  });

  try {
    const email = 'superadmin@sante.sn';
    const correctPassword = 'demo123';
    
    console.log('=== CORRECTION DU MOT DE PASSE ===\n');
    
    // Mettre à jour le mot de passe
    await connection.execute('UPDATE users SET password = ? WHERE email = ?', [correctPassword, email]);
    
    console.log(`✅ Mot de passe corrigé pour ${email}`);
    console.log(`🔑 Nouveau mot de passe: "${correctPassword}"`);
    
    // Vérifier la correction
    const [users] = await connection.execute('SELECT password FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    console.log(`🔍 Vérification: "${user.password}"`);
    console.log(`✅ Longueur: ${user.password.length} caractères`);
    
    if (user.password === correctPassword) {
      console.log('\n🎉 Mot de passe corrigé avec succès !');
    } else {
      console.log('\n❌ Le mot de passe n\'est pas encore correct');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

fixPassword().catch(console.error);
