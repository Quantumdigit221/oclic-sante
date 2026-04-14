import mysql from 'mysql2/promise';

async function checkAllPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'sante_saas'
  });

  try {
    console.log('=== VÉRIFICATION DE TOUS LES MOTS DE PASSE ===\n');
    
    const [users] = await connection.execute('SELECT email, password, LENGTH(password) as length FROM users ORDER BY email');
    
    let problems = [];
    
    users.forEach(user => {
      const expectedPassword = 'demo123';
      const actualPassword = user.password;
      const hasProblem = actualPassword !== expectedPassword || actualPassword.length !== expectedPassword.length;
      
      if (hasProblem) {
        problems.push(user);
        console.log(`❌ ${user.email}: "${actualPassword}" (${user.length} caractères)`);
      } else {
        console.log(`✅ ${user.email}: OK`);
      }
    });
    
    if (problems.length > 0) {
      console.log(`\n🔧 Correction de ${problems.length} mot(s) de passe...`);
      
      for (const user of problems) {
        await connection.execute('UPDATE users SET password = ? WHERE email = ?', ['demo123', user.email]);
        console.log(`✅ Corrigé: ${user.email}`);
      }
      
      console.log('\n🎉 Tous les mots de passe ont été corrigés !');
    } else {
      console.log('\n✅ Tous les mots de passe sont corrects !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkAllPasswords().catch(console.error);
