fn main() {
    // `sqlx::migrate!` embebe los .sql al compilar: recompilar si cambian.
    println!("cargo:rerun-if-changed=../migrations");
    tauri_build::build()
}
