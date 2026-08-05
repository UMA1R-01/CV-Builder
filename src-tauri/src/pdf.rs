//! Direct-to-PDF export.
//!
//! `window.print()` hands the user Chromium's print preview, where they still have to
//! switch the destination to "Save as PDF" and untick "Headers and footers". WebView2
//! exposes the same print engine as `ICoreWebView2_7::PrintToPdf`, which renders
//! straight to a file with those settings fixed in code — so the desktop app can offer a
//! one-step "Save as PDF" and leave the Print button for real printers.
//!
//! Output still honours the app's `@media print` rules and the `@page` size that
//! `CVPreview` keeps in sync, so pagination matches the on-screen preview.

use tauri::WebviewWindow;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub async fn save_pdf(
  window: WebviewWindow,
  default_name: String,
  width_in: f64,
  height_in: f64,
) -> Result<Option<String>, String> {
  let dialog_window = window.clone();
  let chosen = tauri::async_runtime::spawn_blocking(move || {
    dialog_window
      .dialog()
      .file()
      .set_file_name(default_name)
      .add_filter("PDF Document", &["pdf"])
      .blocking_save_file()
  })
  .await
  .map_err(|e| e.to_string())?;

  let Some(file_path) = chosen else {
    return Ok(None);
  };
  let path = file_path.into_path().map_err(|e| e.to_string())?;
  let target = path.display().to_string();

  tauri::async_runtime::spawn_blocking(move || print_to_pdf(&window, target, width_in, height_in))
    .await
    .map_err(|e| e.to_string())??;

  Ok(Some(path.display().to_string()))
}

#[cfg(windows)]
fn print_to_pdf(
  window: &WebviewWindow,
  path: String,
  width_in: f64,
  height_in: f64,
) -> Result<(), String> {
  use std::sync::mpsc;
  use webview2_com::Microsoft::Web::WebView2::Win32::{
    ICoreWebView2Environment6, ICoreWebView2_2, ICoreWebView2_7,
  };
  use webview2_com::PrintToPdfCompletedHandler;
  use windows::core::{Interface, HSTRING, PCWSTR};

  fn com_err(e: windows::core::Error) -> String {
    format!("WebView2 print failed: {e}")
  }

  let (tx, rx) = mpsc::channel::<Result<(), String>>();
  let dispatch_tx = tx.clone();

  window
    .with_webview(move |webview| {
      let handler_tx = dispatch_tx.clone();
      let started = (|| -> Result<(), String> {
        unsafe {
          let core = webview.controller().CoreWebView2().map_err(com_err)?;

          let environment = core
            .cast::<ICoreWebView2_2>()
            .map_err(com_err)?
            .Environment()
            .map_err(com_err)?;
          let settings = environment
            .cast::<ICoreWebView2Environment6>()
            .map_err(com_err)?
            .CreatePrintSettings()
            .map_err(com_err)?;

          // The whole point of this path: no browser furniture, and page geometry
          // driven by the CV's own paper size rather than the print dialog's default.
          settings.SetShouldPrintBackgrounds(true).map_err(com_err)?;
          settings
            .SetShouldPrintHeaderAndFooter(false)
            .map_err(com_err)?;
          settings.SetPageWidth(width_in).map_err(com_err)?;
          settings.SetPageHeight(height_in).map_err(com_err)?;
          settings.SetMarginTop(0.0).map_err(com_err)?;
          settings.SetMarginBottom(0.0).map_err(com_err)?;
          settings.SetMarginLeft(0.0).map_err(com_err)?;
          settings.SetMarginRight(0.0).map_err(com_err)?;

          let handler = PrintToPdfCompletedHandler::create(Box::new(move |result, success| {
            let outcome = match result {
              Ok(()) if success => Ok(()),
              Ok(()) => Err("WebView2 could not write the PDF file.".to_string()),
              Err(e) => Err(com_err(e)),
            };
            let _ = handler_tx.send(outcome);
            Ok(())
          }));

          let target = HSTRING::from(path.as_str());
          core
            .cast::<ICoreWebView2_7>()
            .map_err(com_err)?
            .PrintToPdf(PCWSTR(target.as_ptr()), &settings, &handler)
            .map_err(com_err)?;
        }
        Ok(())
      })();

      // On the happy path the completion handler above owns the reply; only report
      // here when the call never got far enough to register it.
      if let Err(e) = started {
        let _ = dispatch_tx.send(Err(e));
      }
    })
    .map_err(|e| e.to_string())?;

  rx.recv()
    .map_err(|_| "PDF export ended without reporting a result.".to_string())?
}

#[cfg(not(windows))]
fn print_to_pdf(_: &WebviewWindow, _: String, _: f64, _: f64) -> Result<(), String> {
  Err("Direct PDF export is only implemented for WebView2 on Windows.".to_string())
}
