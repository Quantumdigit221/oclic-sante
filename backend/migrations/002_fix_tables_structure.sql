-- Migration 002: Fix tables structure and add foreign keys

-- Sélectionner la base de données
-- REMPLACEZ 'sante_saas' par le nom de votre base de données si nécessaire
USE sante_saas;

-- Vérifier si une base de données est sélectionnée
SET @db_selected = (SELECT DATABASE());

SET @sql = IF(@db_selected IS NULL, 
             'SELECT ''ERREUR: Aucune base de données n''''est sélectionnée. Utilisez: USE nom_de_la_base;'' AS message;',
             'SELECT CONCAT(''Base de données sélectionnée: '', @db_selected) AS message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Arrêter l'exécution si aucune base n'est sélectionnée
SET @sql = IF(@db_selected IS NULL, 
             'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''Veuillez d''''abord sélectionner une base de données avec: USE nom_de_la_base;'';',
             'SELECT ''Démarrage des migrations...'' AS message;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 1. Vérifier si la table tickets existe
SET @tickets_exists = (SELECT COUNT(*) FROM information_schema.tables 
                      WHERE table_schema = DATABASE() AND table_name = 'tickets');

-- 2. Supprimer les contraintes existantes si elles existent
SET @sql = IF(@tickets_exists > 0,
             'SET FOREIGN_KEY_CHECKS = 0;
              ALTER TABLE tickets 
              DROP FOREIGN KEY IF EXISTS fk_tickets_center,
              DROP FOREIGN KEY IF EXISTS fk_tickets_service,
              DROP FOREIGN KEY IF EXISTS fk_tickets_doctor;
              SET FOREIGN_KEY_CHECKS = 1;',
             'SELECT ''Table tickets does not exist'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Modifier la table tickets si elle existe
SET @sql = IF(@tickets_exists > 0, 
             'ALTER TABLE tickets 
              MODIFY COLUMN status TEXT DEFAULT ''WAITING''',
             'SELECT ''Table tickets does not exist'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Ajouter les contraintes de clés étrangères une par une

-- 3.1. Clé étrangère pour centerId
SET @sql = IF(@tickets_exists > 0 AND 
             (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = DATABASE() AND table_name = 'centers') > 0,
             'ALTER TABLE tickets 
              ADD CONSTRAINT fk_tickets_center 
              FOREIGN KEY (centerId) REFERENCES centers(id) 
              ON DELETE SET NULL 
              ON UPDATE CASCADE',
             'SELECT ''Skipping centerId foreign key'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3.2. Clé étrangère pour serviceId
SET @sql = IF(@tickets_exists > 0 AND 
             (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = DATABASE() AND table_name = 'services') > 0,
             'ALTER TABLE tickets 
              ADD CONSTRAINT fk_tickets_service 
              FOREIGN KEY (serviceId) REFERENCES services(id) 
              ON DELETE SET NULL 
              ON UPDATE CASCADE',
             'SELECT ''Skipping serviceId foreign key'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3.3. Clé étrangère pour doctorId
SET @sql = IF(@tickets_exists > 0 AND 
             (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = DATABASE() AND table_name = 'users') > 0,
             'ALTER TABLE tickets 
              ADD CONSTRAINT fk_tickets_doctor 
              FOREIGN KEY (doctorId) REFERENCES users(id) 
              ON DELETE SET NULL 
              ON UPDATE CASCADE',
             'SELECT ''Skipping doctorId foreign key'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Modifier la table users si elle existe
SET @users_exists = (SELECT COUNT(*) FROM information_schema.tables 
                    WHERE table_schema = DATABASE() AND table_name = 'users');
SET @centers_exists = (SELECT COUNT(*) FROM information_schema.tables 
                      WHERE table_schema = DATABASE() AND table_name = 'centers');

-- 4.1. Ajouter la clé étrangère centerId
SET @sql = IF(@users_exists > 0 AND @centers_exists > 0,
             'ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS centerId TEXT,
              ADD CONSTRAINT fk_users_center 
              FOREIGN KEY (centerId) REFERENCES centers(id) 
              ON DELETE SET NULL 
              ON UPDATE CASCADE',
             'SELECT ''Skipping users.centerId foreign key'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4.2. Modifier la colonne role
SET @sql = IF(@users_exists > 0,
             'ALTER TABLE users 
              MODIFY COLUMN role ENUM(''admin'', ''doctor'', ''nurse'', ''receptionist'', ''pharmacist'', ''accountant'') NOT NULL',
             'SELECT ''Skipping users.role modification'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
ALTER TABLE services
  ADD FOREIGN KEY (centerId) REFERENCES centers(id) ON DELETE CASCADE;

-- Add foreign keys to medicines table
ALTER TABLE medicines
  ADD FOREIGN KEY (centerId) REFERENCES centers(id) ON DELETE CASCADE;

-- Add foreign keys to patients table
ALTER TABLE patients
  ADD FOREIGN KEY (centerId) REFERENCES centers(id) ON DELETE CASCADE,
  MODIFY birthDate DATE,
  MODIFY gender ENUM('male', 'female', 'other'),
  MODIFY createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX idx_tickets_center ON tickets(centerId);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_patients_center ON patients(centerId);
CREATE INDEX idx_services_center ON services(centerId);
CREATE INDEX idx_medicines_center ON medicines(centerId);
