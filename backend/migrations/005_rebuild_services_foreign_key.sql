-- 1. Supprimer les deux contraintes de clé étrangère existantes pour nettoyer la table.
ALTER TABLE services DROP FOREIGN KEY fk_services_health_centers;
ALTER TABLE services DROP FOREIGN KEY services_ibfk_1;

-- 2. Ajouter la contrainte de clé étrangère unique et correcte.
ALTER TABLE services ADD CONSTRAINT fk_services_health_centers FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE ON UPDATE CASCADE;
