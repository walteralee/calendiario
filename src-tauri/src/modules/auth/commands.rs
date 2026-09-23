use sqlx::SqlitePool;
use tauri::State;

use super::service;

#[tauri::command]
pub async fn perfil_existe(pool: State<'_, SqlitePool>) -> Result<bool, String> {
    service::perfil_existe(&pool).await
}

#[tauri::command]
pub async fn tiene_pin(pool: State<'_, SqlitePool>) -> Result<bool, String> {
    service::tiene_pin(&pool).await
}

#[tauri::command]
pub async fn verificar_pin(pool: State<'_, SqlitePool>, pin: String) -> Result<bool, String> {
    service::verificar_pin(&pool, pin).await
}

#[tauri::command]
pub async fn crear_perfil(pool: State<'_, SqlitePool>, pin: Option<String>) -> Result<(), String> {
    service::crear_perfil(&pool, pin).await
}

#[tauri::command]
pub async fn actualizar_pin(
    pool: State<'_, SqlitePool>,
    pin_actual: String,
    pin_nuevo: Option<String>,
) -> Result<(), String> {
    service::actualizar_pin(&pool, pin_actual, pin_nuevo).await
}
