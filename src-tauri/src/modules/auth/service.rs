use sqlx::SqlitePool;
use tauri::async_runtime::spawn_blocking;

use super::repository;

const WRONG_PIN: &str = "PIN incorrecto";

pub async fn profile_exists(pool: &SqlitePool) -> Result<bool, String> {
    let profile = repository::get_profile(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(profile.is_some())
}

pub async fn has_pin(pool: &SqlitePool) -> Result<bool, String> {
    let profile = repository::get_profile(pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(profile.and_then(|p| p.pin_hash).is_some())
}

pub async fn verify_pin(pool: &SqlitePool, pin: String) -> Result<bool, String> {
    let profile = repository::get_profile(pool)
        .await
        .map_err(|e| e.to_string())?;

    let Some(pin_hash) = profile.and_then(|p| p.pin_hash) else {
        return Ok(false);
    };

    verify_hash(pin, pin_hash).await
}

pub async fn create_profile(pool: &SqlitePool, pin: Option<String>) -> Result<(), String> {
    if repository::get_profile(pool)
        .await
        .map_err(|e| e.to_string())?
        .is_some()
    {
        return Err("Ya existe un perfil.".into());
    }

    let pin_hash = hash_pin(pin).await?;

    repository::insert_profile(pool, pin_hash.as_deref())
        .await
        .map_err(|e| e.to_string())
}

/// Cambia o quita el PIN. Si el perfil no tiene PIN, `current_pin` debe ir vacío.
pub async fn update_pin(
    pool: &SqlitePool,
    current_pin: String,
    new_pin: Option<String>,
) -> Result<(), String> {
    let profile = repository::get_profile(pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| WRONG_PIN.to_string())?;

    let matches = match profile.pin_hash {
        Some(hash) => verify_hash(current_pin, hash).await?,
        None => current_pin.is_empty(),
    };
    if !matches {
        return Err(WRONG_PIN.into());
    }

    let pin_hash = hash_pin(new_pin).await?;

    repository::update_pin_hash(pool, pin_hash.as_deref())
        .await
        .map_err(|e| e.to_string())
}

// bcrypt es deliberadamente lento (CPU): se ejecuta en un hilo aparte para no
// bloquear el runtime async de Tauri.

async fn hash_pin(pin: Option<String>) -> Result<Option<String>, String> {
    let Some(pin) = pin.filter(|p| !p.is_empty()) else {
        return Ok(None);
    };

    spawn_blocking(move || bcrypt::hash(pin, bcrypt::DEFAULT_COST))
        .await
        .map_err(|e| e.to_string())?
        .map(Some)
        .map_err(|e| e.to_string())
}

async fn verify_hash(pin: String, pin_hash: String) -> Result<bool, String> {
    spawn_blocking(move || bcrypt::verify(pin, &pin_hash))
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
}
