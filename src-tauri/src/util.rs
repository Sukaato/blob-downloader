use std::path::Path;

use serde::Serialize;
use tauri::api::path::document_dir;

pub fn get_document_dir() -> String {
  document_dir().unwrap().to_str().unwrap().to_owned()
}

pub fn get_app_dir() -> String {
  Path::new(get_document_dir().as_str())
    .join("blob-downloader")
    .to_str()
    .unwrap()
    .to_owned()
}

pub fn get_logs_dir() -> String {
  Path::new(get_app_dir().as_str())
    .join("logs")
    .to_str()
    .unwrap()
    .to_owned()
}

#[derive(Clone, Serialize)]
pub struct LogPayload {
  pub message: String,
  pub level: log::Level,
}
