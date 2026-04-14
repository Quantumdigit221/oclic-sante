-- Migration 003: Fix tables structure - Étape 2
USE sante_saas;

-- 1. Désactiver temporairement les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Table users
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'accountant') NOT NULL,
  ADD COLUMN IF NOT EXISTS centerId TEXT,
  ADD CONSTRAINT fk_users_center 
    FOREIGN KEY (centerId) REFERENCES centers(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 3. Table services
ALTER TABLE services
  ADD CONSTRAINT fk_services_center 
    FOREIGN KEY (centerId) REFERENCES centers(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- 4. Table medicines
ALTER TABLE medicines
  ADD CONSTRAINT fk_medicines_center 
    FOREIGN KEY (centerId) REFERENCES centers(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- 5. Table patients
ALTER TABLE patients
  ADD CONSTRAINT fk_patients_center 
    FOREIGN KEY (centerId) REFERENCES centers(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- 6. Réactiver les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migration 003 - Étape 2 terminée avec succès' AS message;
