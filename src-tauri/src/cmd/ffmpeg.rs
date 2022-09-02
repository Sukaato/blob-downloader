use tauri::api::process::{Command, CommandEvent};
use tauri::async_runtime;
use tauri::Runtime;

use crate::util::LogPayload;

#[tauri::command]
pub async fn command_ffmpeg<R: Runtime>(
  window: tauri::Window<R>,
  args: Vec<String>,
) -> Result<(), String> {
  log::info!(
    "ffmpeg command has called with argument: {}",
    args.join(" ")
  );

  let command = Command::new_sidecar("ffmpeg").unwrap();
  let (mut rx, _) = command.args(args).spawn().unwrap();

  async_runtime::spawn(async move {
    // read events such as stdout
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stderr(line) => {
          log::info!("{}", line);
          window
            .emit(
              "logs",
              LogPayload {
                message: line,
                level: log::Level::Info,
              },
            )
            .unwrap();
        }
        CommandEvent::Terminated(terminated) => {
          log::info!("Download endded: {:#?}", terminated);
          window.emit("logs:end", terminated).unwrap();
        }
        _ => {}
      }
    }
  });
  Ok(())
}
