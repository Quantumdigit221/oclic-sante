-- Migration 004: Création de la table des consultations
USE sante_saas;

-- 1. Désactiver temporairement les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Supprimer la table si elle existe déjà (attention, cela supprimera les données existantes !)
-- DÉCOMMENTEZ LA LIGNE SUIVANTE UNIQUEMENT SI VOUS VOULEZ RECRÉER LA TABLE DE ZÉRO
-- DROP TABLE IF EXISTS consultations;

-- 3. Créer la table consultations si elle n'existe pas
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(36) PRIMARY KEY,
  ticketId VARCHAR(36) NOT NULL,
  patientId VARCHAR(36) NOT NULL,
  doctorId VARCHAR(36),
  centerId VARCHAR(36),
  serviceId VARCHAR(36),
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  weight DECIMAL(5,2) COMMENT 'Poids en kg',
  height DECIMAL(5,2) COMMENT 'Taille en cm',
  temperature DECIMAL(4,1) COMMENT 'Température en °C',
  bloodPressure VARCHAR(20) COMMENT 'Pression artérielle (ex: 120/80)',
  pulse INT COMMENT 'Rythme cardiaque en bpm',
  symptoms TEXT COMMENT 'Symptômes décrits par le patient',
  diagnosis TEXT COMMENT 'Diagnostic du médecin',
  prescription TEXT COMMENT 'Ordonnance et traitements prescrits',
  notes TEXT COMMENT 'Notes supplémentaires',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'État de la consultation',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Contraintes de clés étrangères
  CONSTRAINT fk_consultation_ticket FOREIGN KEY (ticketId) 
    REFERENCES tickets(id) ON DELETE CASCADE,
    
  CONSTRAINT fk_consultation_patient FOREIGN KEY (patientId) 
    REFERENCES patients(id) ON DELETE CASCADE,
    
  CONSTRAINT fk_consultation_doctor FOREIGN KEY (doctorId) 
    REFERENCES users(id) ON DELETE SET NULL,
    
  CONSTRAINT fk_consultation_center FOREIGN KEY (centerId) 
    REFERENCES centers(id) ON DELETE SET NULL,
    
  CONSTRAINT fk_consultation_service FOREIGN KEY (serviceId) 
    REFERENCES services(id) ON DELETE SET NULL,
    
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE KEY uk_consultation_ticket (ticketId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Ajouter des index pour améliorer les performances
-- Ces commandes échoueront silencieusement si les index existent déjà
CREATE INDEX IF NOT EXISTS idx_consultation_patient ON consultations(patientId);
CREATE INDEX IF NOT EXISTS idx_consultation_doctor ON consultations(doctorId);
CREATE INDEX IF NOT EXISTS idx_consultation_center ON consultations(centerId);
CREATE INDEX IF NOT EXISTS idx_consultation_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON consultations(status);

-- 4. Réactiver les vérifications de contraintes
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migration 004 - Table consultations créée avec succès' AS message;
