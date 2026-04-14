-- Migration 002: Fix tables structure - Étape 1
USE sante_saas;

-- 1. Désactiver temporairement les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Supprimer les contraintes existantes (sans vérification d'existence)
ALTER TABLE tickets 
  DROP FOREIGN KEY IF EXISTS fk_tickets_center,
  DROP FOREIGN KEY IF EXISTS fk_tickets_service,
  DROP FOREIGN KEY IF EXISTS fk_tickets_doctor;

-- 3. Modifier la table tickets
ALTER TABLE tickets 
  MODIFY COLUMN status TEXT DEFAULT 'WAITING',
  MODIFY COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 4. Ajouter les contraintes de clés étrangères
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_center 
    FOREIGN KEY (centerId) REFERENCES centers(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_service 
    FOREIGN KEY (serviceId) REFERENCES services(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_doctor 
    FOREIGN KEY (doctorId) REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 5. Réactiver les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migration 002 - Étape 1 terminée avec succès' AS message;