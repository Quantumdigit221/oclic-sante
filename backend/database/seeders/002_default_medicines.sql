-- Seeder: Médicaments par défaut pour les centres de santé
-- Date: 2025-12-09
-- Description: Insertion des médicaments essentiels par défaut

-- Antalgiques et Antipyrétiques
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-1', '{CENTER_ID}', 'Paracétamol 500mg', 'Paracétamol', 200, 50, 500.00, '2025-12-31', 'Antalgique', 'LOT-001', 'Comprimé', 1),
('m-{CENTER_ID}-2', '{CENTER_ID}', 'Paracétamol 1000mg', 'Paracétamol', 100, 20, 750.00, '2025-12-31', 'Antalgique', 'LOT-002', 'Comprimé', 1),
('m-{CENTER_ID}-3', '{CENTER_ID}', 'Ibuprofène 400mg', 'Ibuprofène', 150, 30, 1000.00, '2026-03-15', 'Anti-inflammatoire', 'LOT-003', 'Comprimé', 1),
('m-{CENTER_ID}-4', '{CENTER_ID}', 'Aspirine 500mg', 'Acide acétylsalicylique', 100, 25, 400.00, '2025-08-31', 'Antalgique', 'LOT-004', 'Comprimé', 1),

-- Antibiotiques
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-5', '{CENTER_ID}', 'Amoxicilline 500mg', 'Amoxicilline', 80, 15, 1500.00, '2024-06-30', 'Antibiotique', 'LOT-005', 'Gélule', 1),
('m-{CENTER_ID}-6', '{CENTER_ID}', 'Amoxicilline 1g', 'Amoxicilline', 60, 10, 2000.00, '2024-06-30', 'Antibiotique', 'LOT-006', 'Gélule', 1),
('m-{CENTER_ID}-7', '{CENTER_ID}', 'Azithromycine 500mg', 'Azithromycine', 40, 8, 2500.00, '2025-02-28', 'Antibiotique', 'LOT-007', 'Comprimé', 1),
('m-{CENTER_ID}-8', '{CENTER_ID}', 'Ciprofloxacine 500mg', 'Ciprofloxacine', 50, 12, 1800.00, '2025-04-30', 'Antibiotique', 'LOT-008', 'Comprimé', 1),
('m-{CENTER_ID}-9', '{CENTER_ID}', 'Doxycycline 100mg', 'Doxycycline', 60, 15, 1200.00, '2025-01-15', 'Antibiotique', 'LOT-009', 'Gélule', 1),

-- Antipaludéens
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-10', '{CENTER_ID}', 'Artemether/Lumefantrine', 'Coartem', 30, 10, 2500.00, '2025-01-01', 'Antipaludéen', 'LOT-010', 'Comprimé', 1),
('m-{CENTER_ID}-11', '{CENTER_ID}', 'Chloroquine 100mg', 'Chloroquine', 100, 20, 800.00, '2025-06-30', 'Antipaludéen', 'LOT-011', 'Comprimé', 1),
('m-{CENTER_ID}-12', '{CENTER_ID}', 'Quinine 500mg', 'Quinine', 40, 8, 1500.00, '2024-12-31', 'Antipaludéen', 'LOT-012', 'Comprimé', 1),

-- Antidiarrhéiques et Réhydratation
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-13', '{CENTER_ID}', 'Smecta 3g', 'Diosmectite', 80, 20, 600.00, '2025-09-30', 'Antidiarrhéique', 'LOT-013', 'Poudre', 1),
('m-{CENTER_ID}-14', '{CENTER_ID}', 'Lopéramide 2mg', 'Lopéramide', 50, 15, 800.00, '2025-07-31', 'Antidiarrhéique', 'LOT-014', 'Gélule', 1),
('m-{CENTER_ID}-15', '{CENTER_ID}', 'Sérum physiologique 500ml', 'Chlorure de sodium', 30, 10, 1000.00, '2026-01-31', 'Réhydratation', 'LOT-015', 'Solution', 1),
('m-{CENTER_ID}-16', '{CENTER_ID}', 'Soluté de réhydratation', 'SRO', 100, 25, 500.00, '2026-01-31', 'Réhydratation', 'LOT-016', 'Sachet', 1),

-- Diabète
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-17', '{CENTER_ID}', 'Metformine 850mg', 'Metformine', 60, 12, 1200.00, '2025-04-30', 'Antidiabétique', 'LOT-017', 'Comprimé', 1),
('m-{CENTER_ID}-18', '{CENTER_ID}', 'Glibenclamide 5mg', 'Glibenclamide', 40, 8, 1500.00, '2025-03-31', 'Antidiabétique', 'LOT-018', 'Comprimé', 1),

-- Vitamines et Suppléments
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-19', '{CENTER_ID}', 'Vitamine C 500mg', 'Acide ascorbique', 150, 30, 300.00, '2025-11-30', 'Vitamine', 'LOT-019', 'Comprimé', 1),
('m-{CENTER_ID}-20', '{CENTER_ID}', 'Vitamine D3 1000UI', 'Cholécalciférol', 80, 20, 800.00, '2025-12-31', 'Vitamine', 'LOT-020', 'Gélule', 1),
('m-{CENTER_ID}-21', '{CENTER_ID}', 'Fer 200mg', 'Sulfate ferreux', 80, 20, 600.00, '2025-09-30', 'Supplémentation', 'LOT-021', 'Comprimé', 1),
('m-{CENTER_ID}-22', '{CENTER_ID}', 'Acide folique 5mg', 'Acide folique', 100, 25, 400.00, '2025-10-31', 'Supplémentation', 'LOT-022', 'Comprimé', 1),

-- Dermatologie
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-23', '{CENTER_ID}', 'Bétadine 5%', 'Povidone iodée', 40, 10, 1200.00, '2025-08-31', 'Antiseptique', 'LOT-023', 'Solution', 1),
('m-{CENTER_ID}-24', '{CENTER_ID}', 'Dakin', 'Hypochlorite de sodium', 30, 8, 800.00, '2025-06-30', 'Antiseptique', 'LOT-024', 'Solution', 1),
('m-{CENTER_ID}-25', '{CENTER_ID}', 'Gentamicine 0.3%', 'Gentamicine', 50, 12, 1500.00, '2025-07-31', 'Antibiotique local', 'LOT-025', 'Crème', 1),

-- Cardiovasculaire
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-26', '{CENTER_ID}', 'Amlodipine 5mg', 'Amlodipine', 60, 12, 1500.00, '2025-04-30', 'Antihypertenseur', 'LOT-026', 'Comprimé', 1),
('m-{CENTER_ID}-27', '{CENTER_ID}', 'Lisinopril 10mg', 'Lisinopril', 50, 10, 1800.00, '2025-03-31', 'Antihypertenseur', 'LOT-027', 'Comprimé', 1),
('m-{CENTER_ID}-28', '{CENTER_ID}', 'Hydrochlorothiazide 25mg', 'HCTZ', 70, 15, 800.00, '2025-05-31', 'Diurétique', 'LOT-028', 'Comprimé', 1),

-- Gastro-entérologie
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-29', '{CENTER_ID}', 'Oméprazole 20mg', 'Oméprazole', 70, 15, 1200.00, '2025-05-31', 'Antiulcéreux', 'LOT-029', 'Gélule', 1),
('m-{CENTER_ID}-30', '{CENTER_ID}', 'Maalox', 'Hydroxyde d\'aluminium', 40, 10, 1000.00, '2025-10-31', 'Antiulcéreux', 'LOT-030', 'Suspension', 1),

-- Respiratoire
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-31', '{CENTER_ID}', 'Salbutamol 100µg', 'Salbutamol', 40, 8, 2500.00, '2025-03-15', 'Bronchodilatateur', 'LOT-031', 'Aérosol', 1),
('m-{CENTER_ID}-32', '{CENTER_ID}', 'Ventoline', 'Salbutamol', 30, 6, 3000.00, '2025-02-28', 'Bronchodilatateur', 'LOT-032', 'Aérosol', 1),

-- Vaccins
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-33', '{CENTER_ID}', 'Vaccin BCG', 'BCG', 20, 5, 3000.00, '2024-12-31', 'Vaccin', 'LOT-033', 'Flacon', 1),
('m-{CENTER_ID}-34', '{CENTER_ID}', 'Vaccin DTCoq', 'DTCoq', 20, 5, 2500.00, '2024-12-31', 'Vaccin', 'LOT-034', 'Flacon', 1),
('m-{CENTER_ID}-35', '{CENTER_ID}', 'Vaccin Anti-Rougeole', 'Rougeole', 15, 3, 2000.00, '2024-11-30', 'Vaccin', 'LOT-035', 'Flacon', 1),

-- Sérums
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-36', '{CENTER_ID}', 'Sérum antitétanique', 'Sérum ATS', 15, 3, 5000.00, '2024-11-30', 'Sérum', 'LOT-036', 'Ampoule', 1),

-- Matériel médical consommable
INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, isActive) VALUES 
('m-{CENTER_ID}-37', '{CENTER_ID}', 'Gants stériles', 'Gants', 200, 50, 100.00, '2026-12-31', 'Matériel', 'LOT-037', 'Boîte', 1),
('m-{CENTER_ID}-38', '{CENTER_ID}', 'Seringues 5ml', 'Seringue', 300, 100, 150.00, '2026-12-31', 'Matériel', 'LOT-038', 'Unité', 1),
('m-{CENTER_ID}-39', '{CENTER_ID}', 'Coton hydrophile', 'Coton', 100, 20, 500.00, '2026-12-31', 'Matériel', 'LOT-039', 'Paquet', 1),
('m-{CENTER_ID}-40', '{CENTER_ID}', 'Compresses stériles', 'Compresse', 150, 30, 800.00, '2026-12-31', 'Matériel', 'LOT-040', 'Paquet', 1),
('m-{CENTER_ID}-41', '{CENTER_ID}', 'Bandes élastiques', 'Bande', 50, 10, 1200.00, '2026-12-31', 'Matériel', 'LOT-041', 'Rouleau', 1),
('m-{CENTER_ID}-42', '{CENTER_ID}', 'Pansements adhésifs', 'Pansement', 100, 25, 300.00, '2026-12-31', 'Matériel', 'LOT-042', 'Boîte', 1);
