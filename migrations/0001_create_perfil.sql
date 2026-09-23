-- Perfil local único: la app es de una sola persona. El CHECK (id = 1)
-- garantiza a nivel de BD que nunca puede haber más de una fila.
CREATE TABLE IF NOT EXISTS perfil (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pin_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
