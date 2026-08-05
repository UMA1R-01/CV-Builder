//! Native Save As / Open dialogs.
//!
//! The web build still uses blob downloads and `<input type="file">`; these commands
//! exist so the desktop build gets real Windows file dialogs instead. Writing is
//! deliberately bundled with the dialog rather than exposed as a standalone
//! "write any path" command, so the frontend can only ever write to a location the
//! user just picked.

use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// `blocking_*` dialog helpers panic if called on the main thread, and Tauri runs
/// non-async commands there — hence `async fn` plus an explicit blocking pool hop.
async fn pick<T, F>(f: F) -> Result<T, String>
where
  T: Send + 'static,
  F: FnOnce() -> T + Send + 'static,
{
  tauri::async_runtime::spawn_blocking(f)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_text_file(
  app: AppHandle,
  default_name: String,
  filter_name: String,
  extensions: Vec<String>,
  contents: String,
) -> Result<Option<String>, String> {
  let chosen = pick(move || {
    let exts: Vec<&str> = extensions.iter().map(String::as_str).collect();
    app
      .dialog()
      .file()
      .set_file_name(default_name)
      .add_filter(filter_name, &exts)
      .blocking_save_file()
  })
  .await?;

  let Some(file_path) = chosen else {
    return Ok(None);
  };
  let path = file_path.into_path().map_err(|e| e.to_string())?;
  std::fs::write(&path, contents).map_err(|e| e.to_string())?;
  Ok(Some(path.display().to_string()))
}

#[tauri::command]
pub async fn open_text_file(
  app: AppHandle,
  filter_name: String,
  extensions: Vec<String>,
) -> Result<Option<String>, String> {
  let chosen = pick(move || {
    let exts: Vec<&str> = extensions.iter().map(String::as_str).collect();
    app
      .dialog()
      .file()
      .add_filter(filter_name, &exts)
      .blocking_pick_file()
  })
  .await?;

  let Some(file_path) = chosen else {
    return Ok(None);
  };
  let path = file_path.into_path().map_err(|e| e.to_string())?;
  let contents = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
  Ok(Some(contents))
}
