#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app_logs;
mod cmd;
mod util;

use std::fs::create_dir_all;

use crate::util::get_logs_dir;

fn main() {
  create_dir_all(get_logs_dir()).unwrap();

  app_logs::setup();
  log::info!("App start");

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      cmd::check_internet::command_check_internet,
      cmd::ffmpeg::command_ffmpeg,
      cmd::app::command_versions,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
