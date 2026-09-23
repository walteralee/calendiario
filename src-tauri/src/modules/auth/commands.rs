use sqlx::SqlitePool;
use tauri::State;

use super::service;

#[tauri::command]
pub async fn profile_exists(pool: State<'_, SqlitePool>) -> Result<bool, String> {
    service::profile_exists(&pool).await
}

#[tauri::command]
pub async fn has_pin(pool: State<'_, SqlitePool>) -> Result<bool, String> {
    service::has_pin(&pool).await
}

#[tauri::command]
pub async fn verify_pin(pool: State<'_, SqlitePool>, pin: String) -> Result<bool, String> {
    service::verify_pin(&pool, pin).await
}

#[tauri::command]
pub async fn create_profile(
    pool: State<'_, SqlitePool>,
    pin: Option<String>,
) -> Result<(), String> {
    service::create_profile(&pool, pin).await
}

#[tauri::command]
pub async fn update_pin(
    pool: State<'_, SqlitePool>,
    current_pin: String,
    new_pin: Option<String>,
) -> Result<(), String> {
    service::update_pin(&pool, current_pin, new_pin).await
}
