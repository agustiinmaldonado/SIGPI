-- V1__init.sql
-- Migración inicial. Verifica que Flyway está ejecutando correctamente.
-- En la Fase 1 se crearán las tablas reales.

CREATE TABLE dummy_init (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dummy_init (description) VALUES ('Flyway inicializado correctamente');
