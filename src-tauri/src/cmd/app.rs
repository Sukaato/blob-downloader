use tauri::{
  api::process::{Command, CommandEvent},
  Runtime,
};

#[derive(Default, serde::Serialize, Clone)]
pub struct AppInfo {
  ffmpeg_version: Option<String>,
  app_version: String,
  app_name: String,
}

#[tauri::command]
pub async fn command_versions<R: Runtime>(app: tauri::AppHandle<R>) -> Result<AppInfo, String> {
  let command = Command::new_sidecar("ffmpeg").unwrap();
  let (mut rx, _) = command.args(["--version"]).spawn().unwrap();

  let mut infos = AppInfo {
    app_name: app.config().package.product_name.as_ref().unwrap().clone(),
    app_version: app.config().package.version.as_ref().unwrap().clone(),
    ffmpeg_version: Option::None,
  };

  let event = rx.recv().await.unwrap();
  match event {
    CommandEvent::Stderr(line) => {
      log::info!("{}", line);
      infos.ffmpeg_version = Some(line);
    }
    _ => {}
  }

  Ok(infos)
}
