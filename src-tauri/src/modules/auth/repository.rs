use sqlx::SqlitePool;

use super::model::Perfil;

pub async fn obtener_perfil(pool: &SqlitePool) -> Result<Option<Perfil>, sqlx::Error> {
    sqlx::query_as::<_, Perfil>("SELECT id, pin_hash, created_at FROM perfil WHERE id = 1")
        .fetch_optional(pool)
        .await
}

pub async fn insertar_perfil(pool: &SqlitePool, pin_hash: Option<&str>) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO perfil (id, pin_hash) VALUES (1, ?)")
        .bind(pin_hash)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn actualizar_pin_hash(
    pool: &SqlitePool,
    pin_hash: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE perfil SET pin_hash = ? WHERE id = 1")
        .bind(pin_hash)
        .execute(pool)
        .await?;
    Ok(())
}
