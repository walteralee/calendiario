use sqlx::SqlitePool;
use tauri::async_runtime::spawn_blocking;

use super::repository;

const PIN_INCORRECTO: &str = "PIN incorrecto";

pub async fn perfil_existe(pool: &SqlitePool) -> Result<bool, String> {
    let perfil = repository::obtener_perfil(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(perfil.is_some())
}

pub async fn tiene_pin(pool: &SqlitePool) -> Result<bool, String> {
    let perfil = repository::obtener_perfil(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(perfil.and_then(|p| p.pin_hash).is_some())
}

pub async fn verificar_pin(pool: &SqlitePool, pin: String) -> Result<bool, String> {
    let perfil = repository::obtener_perfil(pool)
        .await
        .map_err(|e| e.to_string())?;

    let Some(pin_hash) = perfil.and_then(|p| p.pin_hash) else {
        return Ok(false);
    };

    verificar(pin, pin_hash).await
}

pub async fn crear_perfil(pool: &SqlitePool, pin: Option<String>) -> Result<(), String> {
    if repository::obtener_perfil(pool)
        .await
        .map_err(|e| e.to_string())?
        .is_some()
    {
        return Err("Ya existe un perfil.".into());
    }

    let pin_hash = hashear(pin).await?;

    repository::insertar_perfil(pool, pin_hash.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// Cambia o quita el PIN. Si el perfil no tiene PIN, `pin_actual` debe ir vacío.
pub async fn actualizar_pin(
    pool: &SqlitePool,
    pin_actual: String,
    pin_nuevo: Option<String>,
) -> Result<(), String> {
    let perfil = repository::obtener_perfil(pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| PIN_INCORRECTO.to_string())?;

    let coincide = match perfil.pin_hash {
        Some(hash) => verificar(pin_actual, hash).await?,
        None => pin_actual.is_empty(),
    };
    if !coincide {
        return Err(PIN_INCORRECTO.into());
    }

    let pin_hash = hashear(pin_nuevo).await?;

    repository::actualizar_pin_hash(pool, pin_hash.as_deref())
        .await
        .map_err(|e| e.to_string())
}

// bcrypt es deliberadamente lento (CPU): se ejecuta en un hilo aparte para no
// bloquear el runtime async de Tauri.

async fn hashear(pin: Option<String>) -> Result<Option<String>, String> {
    let Some(pin) = pin.filter(|p| !p.is_empty()) else {
        return Ok(None);
    };

    spawn_blocking(move || bcrypt::hash(pin, bcrypt::DEFAULT_COST))
        .await
        .map_err(|e| e.to_string())?
        .map(Some)
        .map_err(|e| e.to_string())
}

async fn verificar(pin: String, pin_hash: String) -> Result<bool, String> {
    spawn_blocking(move || bcrypt::verify(pin, &pin_hash))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
}
