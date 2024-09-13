// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_mouse_position() -> (i32, i32) {
    use enigo::{Enigo, Mouse, Settings};
    use std::{thread, time::Duration};

    let enigo = Enigo::new(&Settings::default()).expect("Failed to create Enigo instance");
    loop {
        match enigo.location() {
            Ok(position) => return position,
            Err(_) => {
                // TODO: throttle/debounce this
                thread::sleep(Duration::from_millis(100));
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, get_mouse_position])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
