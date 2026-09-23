use std::path::Path;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};

/// Abre (o crea) `calendiario.db` dentro de `dir` y aplica las migraciones
/// pendientes de `../migrations`.
pub async fn init_pool(dir: &Path) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    std::fs::create_dir_all(dir)?;

    let options = SqliteConnectOptions::new()
        .filename(dir.join("calendiario.db"))
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new().connect_with(options).await?;

    sqlx::migrate!("../migrations").run(&pool).await?;

    Ok(pool)
}
