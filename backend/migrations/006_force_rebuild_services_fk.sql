-- Ce script nettoie et reconstruit la clé étrangère de la table 'services'.

-- 1. Tenter de supprimer les contraintes connues (les erreurs seront ignorées si elles n'existent pas).
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;
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
        SET @query = CONCAT('ALTER TABLE ', tableName, ' DROP FOREIGN KEY ', constraintName, ';');
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;

CALL DropForeignKeyIfExists('services', 'fk_services_center');
CALL DropForeignKeyIfExists('services', 'fk_services_health_centers');
CALL DropForeignKeyIfExists('services', 'services_ibfk_1');

DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

-- 2. Ajouter la contrainte de clé étrangère unique et correcte.
ALTER TABLE services ADD CONSTRAINT fk_services_health_centers_final FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE ON UPDATE CASCADE;
