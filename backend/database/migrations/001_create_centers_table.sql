-- Migration: Création de la table health_centers
-- Date: 2025-12-09
-- Description: Création de la table des centres de santé

CREATE TABLE IF NOT EXISTS health_centers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  directorName VARCHAR(255),
  rnis VARCHAR(50),
  capacity INT(11),
  pispiAlias VARCHAR(50),
  isActive TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX idx_centers_active ON health_centers(isActive);
CREATE INDEX idx_centers_name ON health_centers(name);
