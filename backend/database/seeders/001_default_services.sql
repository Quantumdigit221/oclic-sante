-- Seeder: Services par défaut pour les centres de santé
-- Date: 2025-12-09
-- Description: Insertion des services médicaux par défaut

-- Services de consultation
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-1', '{CENTER_ID}', 'Consultation Générale', 'Consultation', 2000.00, 3000.00, 20, 1),
('s-{CENTER_ID}-2', '{CENTER_ID}', 'Consultation Prénatale', 'Maternité', 1500.00, 2000.00, 30, 1),
('s-{CENTER_ID}-3', '{CENTER_ID}', 'Consultation Pédiatrique', 'Pédiatrie', 2500.00, 3500.00, 25, 1),
('s-{CENTER_ID}-4', '{CENTER_ID}', 'Consultation de Contrôle', 'Consultation', 1000.00, 1500.00, 15, 1),

-- Services de soins
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-5', '{CENTER_ID}', 'Pansement Simple', 'Soins', 1000.00, 1500.00, 15, 1),
('s-{CENTER_ID}-6', '{CENTER_ID}', 'Pansement Compliqué', 'Soins', 2000.00, 3000.00, 30, 1),
('s-{CENTER_ID}-7', '{CENTER_ID}', 'Injection IM', 'Soins', 500.00, 1000.00, 5, 1),
('s-{CENTER_ID}-8', '{CENTER_ID}', 'Perfusion', 'Soins', 3000.00, 5000.00, 45, 1),
('s-{CENTER_ID}-9', '{CENTER_ID}', 'Suture', 'Soins', 5000.00, 8000.00, 30, 1),

-- Services de maternité
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-10', '{CENTER_ID}', 'Accouchement Normal', 'Maternité', 15000.00, 25000.00, 120, 1),
('s-{CENTER_ID}-11', '{CENTER_ID}', 'Accouchement Césarien', 'Maternité', 50000.00, 80000.00, 180, 1),
('s-{CENTER_ID}-12', '{CENTER_ID}', 'Suivi Post-Natal', 'Maternité', 2000.00, 3000.00, 20, 1),

-- Services d'urgence
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-13', '{CENTER_ID}', 'Consultation d\'Urgence', 'Urgence', 5000.00, 8000.00, 30, 1),
('s-{CENTER_ID}-14', '{CENTER_ID}', 'Plaie et Traumatisme', 'Urgence', 3000.00, 5000.00, 25, 1),
('s-{CENTER_ID}-15', '{CENTER_ID}', 'Malaise Aigu', 'Urgence', 4000.00, 6000.00, 20, 1),

-- Services de prévention
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-16', '{CENTER_ID}', 'Vaccination BCG', 'Vaccination', 1500.00, 2000.00, 15, 1),
('s-{CENTER_ID}-17', '{CENTER_ID}', 'Vaccination Pentavalent', 'Vaccination', 2000.00, 3000.00, 15, 1),
('s-{CENTER_ID}-18', '{CENTER_ID}', 'Vaccination Rougeole', 'Vaccination', 1500.00, 2000.00, 15, 1),
('s-{CENTER_ID}-19', '{CENTER_ID}', 'Dépistage Paludisme', 'Dépistage', 2500.00, 4000.00, 20, 1),
('s-{CENTER_ID}-20', '{CENTER_ID}', 'Dépistage VIH', 'Dépistage', 3000.00, 5000.00, 20, 1),

-- Services de laboratoire
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-21', '{CENTER_ID}', 'NFS (Hémogramme)', 'Laboratoire', 3000.00, 4000.00, 1, 1),
('s-{CENTER_ID}-22', '{CENTER_ID}', 'Groupe Sanguin', 'Laboratoire', 2000.00, 3000.00, 1, 1),
('s-{CENTER_ID}-23', '{CENTER_ID}', 'Glycémie', 'Laboratoire', 1500.00, 2500.00, 1, 1),
('s-{CENTER_ID}-24', '{CENTER_ID}', 'Test de Grossesse', 'Laboratoire', 2000.00, 3000.00, 1, 1),
('s-{CENTER_ID}-25', '{CENTER_ID}', 'Examen d\'Urine', 'Laboratoire', 2500.00, 3500.00, 1, 1),

-- Services d'imagerie
INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive) VALUES 
('s-{CENTER_ID}-26', '{CENTER_ID}', 'Échographie Abdominale', 'Imagerie', 10000.00, 12000.00, 20, 1),
('s-{CENTER_ID}-27', '{CENTER_ID}', 'Échographie Pelvienne', 'Imagerie', 12000.00, 15000.00, 25, 1),
('s-{CENTER_ID}-28', '{CENTER_ID}', 'Échographie Obstétricale', 'Imagerie', 15000.00, 20000.00, 30, 1),
('s-{CENTER_ID}-29', '{CENTER_ID}', 'Radio Thorax', 'Imagerie', 8000.00, 12000.00, 15, 1),
('s-{CENTER_ID}-30', '{CENTER_ID}', 'Radio Membre', 'Imagerie', 6000.00, 8000.00, 10, 1);
