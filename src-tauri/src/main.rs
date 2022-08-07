#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use online::check;
use tauri::Runtime;
use tauri::api::process::{Command, CommandEvent};
use tauri::async_runtime;

#[tauri::command]
fn command_close<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
  window.close().unwrap();

  Ok(())
}

#[tauri::command]
fn command_reduce<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
  window.hide().unwrap();

  Ok(())
}

#[tauri::command]
async fn command_check_internet() -> Result<bool, ()> {
  let is_connected = check(None).await.is_ok();
  Ok(is_connected)
}


// remember to call `.manage(MyState::default())`
#[tauri::command]
async fn command_ffmpeg(args: Vec<String>) -> Result<(), String> {
  println!("{:#?}", args);

  let (mut rx, _) = Command::new_sidecar("ffmpeg")
    .expect("failed to create `bin/ffmpeg` binary command")
    .args(args)
    .spawn()
    .expect("Failed to spawn sidecar");

  println!("ffmpeg has been called");

  async_runtime::spawn(async move {
    // read events such as stdout
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout (line) => {
          println!("Line: {}", line);
        }
        CommandEvent::Stderr (error) => {
          println!("Error: {}", error);
        }
        CommandEvent::Terminated (terminated) => {
          println!("End: {:#?}", terminated);
        }
        CommandEvent::Error (error) => {
          println!("Error: {}", error);
        }
        _ => {}
      }
    }
  });
  Ok(())
}


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      command_close,
      command_reduce,
      command_check_internet,
      command_ffmpeg,
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

