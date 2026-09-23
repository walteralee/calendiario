mod db;
mod modules;

use modules::auth::commands::{
    actualizar_pin, crear_perfil, perfil_existe, tiene_pin, verificar_pin,
};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            let pool = tauri::async_runtime::block_on(db::init_pool(&data_dir))?;
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            perfil_existe,
            tiene_pin,
            verificar_pin,
            crear_perfil,
            actualizar_pin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
