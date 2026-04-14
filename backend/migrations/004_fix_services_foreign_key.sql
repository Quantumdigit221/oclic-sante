-- 1. Supprimer l'ancienne contrainte de clé étrangère incorrecte.
-- Le nom 'fk_services_center' est déduit du message d'erreur.
ALTER TABLE services DROP FOREIGN KEY fk_services_center;

-- 2. Ajouter la nouvelle contrainte de clé étrangère correcte qui pointe vers 'health_centers'.
ALTER TABLE services ADD CONSTRAINT fk_services_health_centers FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE ON UPDATE CASCADE;
