use std::path::{Path, PathBuf};

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use tauri::{AppHandle, Manager};

/// Carpeta de datos de la app (`%APPDATA%\com.calendiario.desktop` en Windows).
///
/// En compilaciones de desarrollo (`debug_assertions`, p. ej. `npm run tauri dev`)
/// se usa una carpeta hermana con sufijo `.dev`, para que las pruebas nunca pisen
/// la base de datos de la app instalada.
pub fn data_dir(app: &AppHandle) -> tauri::Result<PathBuf> {
    let dir = app.path().app_data_dir()?;

    if !cfg!(debug_assertions) {
        return Ok(dir);
    }

    let mut name = dir.file_name().unwrap_or_default().to_os_string();
    name.push(".dev");
    Ok(dir.with_file_name(name))
}

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
