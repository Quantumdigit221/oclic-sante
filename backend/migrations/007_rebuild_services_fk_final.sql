-- Ce script nettoie et reconstruit la clé étrangère de la table 'services'.

DELIMITER $$

-- Procédure pour supprimer une clé étrangère si elle existe
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists$$
CREATE PROCEDURE DropForeignKeyIfExists(IN tableName VARCHAR(64), IN constraintName VARCHAR(64))
BEGIN
    IF EXISTS(
        SELECT * FROM information_schema.table_constraints
        WHERE 
            table_schema = DATABASE() AND
            table_name = tableName AND
            constraint_name = constraintName AND
            constraint_type = 'FOREIGN KEY')
    THEN
        SET @query = CONCAT('ALTER TABLE ', tableName, ' DROP FOREIGN KEY ', constraintName);
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Supprimer toutes les contraintes potentiellement conflictuelles
CALL DropForeignKeyIfExists('services', 'fk_services_center');
CALL DropForeignKeyIfExists('services', 'fk_services_health_centers');
CALL DropForeignKeyIfExists('services', 'services_ibfk_1');
CALL DropForeignKeyIfExists('services', 'fk_services_health_centers_final');

-- Supprimer la procédure
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;

-- Ajouter la contrainte de clé étrangère unique et correcte
ALTER TABLE services ADD CONSTRAINT fk_services_health_centers FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE ON UPDATE CASCADE;
