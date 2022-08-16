use online::check;

#[tauri::command]
pub async fn command_check_internet() -> Result<bool, ()> {
  let is_connected = check(None).await.is_ok();
  Ok(is_connected)
}
