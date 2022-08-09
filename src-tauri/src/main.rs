#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use online::check;
use tauri::Runtime;
use tauri::api::process::{Command, CommandEvent};
use tauri::async_runtime;
use log::LevelFilter;
use log4rs::append::file::FileAppender;
use log4rs::encode::pattern::PatternEncoder;
use log4rs::config::{Appender, Config, Root};

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
    log::error!("{}", result_command.unwrap_err());
    return Err(());
  } else {
    log::info!("ffmpeg command created");
  }

  let receiver = result_command.unwrap()
    .args(args)
    .spawn();
  if receiver.is_err() {
    log::error!("{}", receiver.unwrap_err());
    return Err(());
  } else {
    log::info!("ffmpeg receiver created");
  }

  log::info!("ffmpeg has been called");
  let (mut rx, _) = receiver.unwrap();

  async_runtime::spawn(async move {
    // read events such as stdout
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout (line) => {
          println!("Line: {}", line);
          window.emit("logs", line).unwrap();
        }
        CommandEvent::Stderr (line) => {
          log::info!("{}", line);
          window.emit("logs", line).unwrap();
        }
        CommandEvent::Terminated (terminated) => {
          log::info!("Download end !");
          window.emit("logs:end", terminated).unwrap();
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
  let logfile = FileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("{l} - {m}\n")))
    .build("log/output.log")
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

