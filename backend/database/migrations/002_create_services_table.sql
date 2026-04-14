-- Migration: Création de la table services
-- Date: 2025-12-09
-- Description: Création de la table des services médicaux

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  emergencyPrice DECIMAL(10,2),
  durationMinutes INT(11),
  isActive TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_services_center ON services(centerId);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(isActive);
