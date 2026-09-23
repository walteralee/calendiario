use sqlx::SqlitePool;

use super::model::Profile;

pub async fn get_profile(pool: &SqlitePool) -> Result<Option<Profile>, sqlx::Error> {
    sqlx::query_as::<_, Profile>("SELECT id, pin_hash, created_at FROM profile WHERE id = 1")
        .fetch_optional(pool)
        .await
}

pub async fn insert_profile(pool: &SqlitePool, pin_hash: Option<&str>) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO profile (id, pin_hash) VALUES (1, ?)")
        .bind(pin_hash)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_pin_hash(pool: &SqlitePool, pin_hash: Option<&str>) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE profile SET pin_hash = ? WHERE id = 1")
        .bind(pin_hash)
        .execute(pool)
        .await?;
    Ok(())
}
