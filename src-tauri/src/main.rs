#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;
mod app_logs;

fn main() {
  app_logs::setup();
  log::info!("App start");

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      cmd::check_internet::command_check_internet,
      cmd::ffmpeg::command_ffmpeg,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
