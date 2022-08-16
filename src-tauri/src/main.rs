#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use online::check;
use serde::Serialize;
use tauri::Runtime;
use tauri::api::process::{Command, CommandEvent};
use tauri::async_runtime;
use tauri::api::path::document_dir;
use log::LevelFilter;
use log4rs::append::file::FileAppender;
use log4rs::encode::pattern::PatternEncoder;
use log4rs::config::{Appender, Config, Root};


#[derive(Clone, Serialize)]
struct LogPayload {
  message: String,
  level: log::Level
}

#[tauri::command]
async fn command_check_internet() -> Result<bool, ()> {
  let is_connected = check(None).await.is_ok();
  Ok(is_connected)
}


#[tauri::command]
async fn command_ffmpeg<R: Runtime>(window: tauri::Window<R>, args: Vec<String>) -> Result<(), ()> {
  log::info!("ffmpeg command has called with argument: {}", args.join(" "));

  let result_command = Command::new_sidecar("ffmpeg");
  if result_command.is_err() {
    let cmd_err = result_command.unwrap_err();
    log::error!("{}", cmd_err);
    window.emit("logs", LogPayload{
      message: cmd_err.to_string(),
      level: log::Level::Error
    }).unwrap();
    return Err(());
  }
  log::info!("ffmpeg command created");
  window.emit("logs", LogPayload{
    message: "ffmpeg command created".into(),
    level: log::Level::Info
  }).unwrap();

  let receiver = result_command.unwrap()
    .args(args)
    .spawn();
  if receiver.is_err() {
    let rcv_err = receiver.unwrap_err();
    log::error!("{}", rcv_err);
    window.emit("logs", LogPayload{
      message: rcv_err.to_string(),
      level: log::Level::Error
    }).unwrap();
    return Err(());
  }
  log::info!("ffmpeg has been called");
  window.emit("logs", LogPayload{
    message: "ffmpeg has been called".into(),
    level: log::Level::Error
  }).unwrap();

  let (mut rx, _) = receiver.unwrap();

  async_runtime::spawn(async move {
    // read events such as stdout
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stderr (line) => {
          log::info!("{}", line);
          window.emit("logs", LogPayload{
            message: line,
            level: log::Level::Info
          }).unwrap();
        }
        CommandEvent::Terminated (terminated) => {
          log::info!("Download endded: {:#?}", terminated);
          window.emit("logs:end", terminated).unwrap();
        }
        _ => {}
      }
    }
  });
  Ok(())
}

fn main() {
  let logfile = FileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("[{l}] - {m}\n")))
    .build(document_dir().unwrap().to_str().unwrap().to_owned() + "/blob-downloader/log/output.log")
    .unwrap();

    let config = Config::builder()
      .appender(Appender::builder().build("logfile", Box::new(logfile)))
      .build(Root::builder()
        .appender("logfile")
        .build(LevelFilter::Info)
      )
      .unwrap();

  log4rs::init_config(config).unwrap();
  log::info!("App start");

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      command_check_internet,
      command_ffmpeg,
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

