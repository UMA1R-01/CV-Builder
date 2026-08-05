mod files;
mod pdf;

use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

/// Hosts the app is allowed to navigate to inside the desktop window:
/// the Vite dev server in development, and Tauri's own asset origin in production.
fn is_app_origin(url: &tauri::Url) -> bool {
  matches!(
    url.host_str(),
    Some("localhost") | Some("127.0.0.1") | Some("tauri.localhost")
  )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      files::save_text_file,
      files::open_text_file,
      pdf::save_pdf
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let handle = app.handle().clone();
      WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("CV Builder")
        // Editor + preview side by side needs width, but keep the default inside a
        // 1440x900 screen's work area so the window isn't clamped down on open.
        .inner_size(1280.0, 800.0)
        .min_inner_size(900.0, 600.0)
        .center()
        // The app's own TopBar doubles as the title bar — a native one on top of it
        // was just two stacked headers. `WindowControls` draws the buttons and the
        // bar carries `data-tauri-drag-region`. Shadow keeps the window looking
        // native (drop shadow + edge snapping) despite being undecorated.
        .decorations(false)
        .shadow(true)
        .on_navigation(move |url| {
          // A desktop window has no back button, so letting a CV's own links
          // (personal site, project URLs, mailto:) navigate the window would
          // strand the app. Hand those to the system browser instead.
          if is_app_origin(url) {
            return true;
          }
          let _ = handle.opener().open_url(url.as_str(), None::<&str>);
          false
        })
        .build()?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
