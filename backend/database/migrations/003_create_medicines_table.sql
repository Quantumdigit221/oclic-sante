-- Migration: Création de la table medicines
-- Date: 2025-12-09
-- Description: Création de la table des médicaments

CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dci VARCHAR(255),
  stock INT(11) DEFAULT 0,
  minStock INT(11) DEFAULT 10,
  price DECIMAL(10,2) NOT NULL,
  expiryDate DATE,
  category VARCHAR(100),
  batchNumber VARCHAR(100),
  form VARCHAR(50),
  isActive TINYINT(1) DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_medicines_center ON medicines(centerId);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_stock ON medicines(stock);
CREATE INDEX idx_medicines_expiry ON medicines(expiryDate);
CREATE INDEX idx_medicines_active ON medicines(isActive);
