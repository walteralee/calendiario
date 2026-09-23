mod db;
mod modules;

use modules::auth::commands::{create_profile, has_pin, profile_exists, update_pin, verify_pin};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = db::data_dir(app.handle())?;
            let pool = tauri::async_runtime::block_on(db::init_pool(&data_dir))?;
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            profile_exists,
            has_pin,
            verify_pin,
            create_profile,
            update_pin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
