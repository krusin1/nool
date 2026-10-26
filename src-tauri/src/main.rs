// Nool desktop: starts Nool's local server (bundled Node.js) and shows it in a window.
// All data stays in the app data folder on this computer.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, RunEvent, Url, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_shell::{process::CommandChild, ShellExt};

/// Fixed so the Figma plugin and MCP config keep working between launches.
const PORT: u16 = 5173;

struct Server(Mutex<Option<CommandChild>>);

/// nool://open or nool://p/<id> from the website or another app: bring the window forward
/// and go to that page. Only paths inside Nool are followed.
fn open_link(app: &tauri::AppHandle, link: &str) {
    let Some(w) = app.get_webview_window("main") else { return };
    let _ = w.unminimize();
    let _ = w.show();
    let _ = w.set_focus();
    let rest = link.trim_start_matches("nool://").trim_start_matches("open").trim_matches('/');
    let ok = rest.chars().all(|c| c.is_ascii_alphanumeric() || "-/".contains(c));
    if ok && !rest.is_empty() && nool_running() {
        if let Ok(url) = Url::parse(&format!("http://localhost:{PORT}/{rest}")) {
            let _ = w.navigate(url);
        }
    }
}

fn connect() -> Option<TcpStream> {
    TcpStream::connect_timeout(&([127, 0, 0, 1], PORT).into(), Duration::from_millis(300)).ok()
}

/// True when a Nool server already answers on the port (another window, or `npm run dev`).
fn nool_running() -> bool {
    let Some(mut s) = connect() else { return false };
    let _ = s.set_read_timeout(Some(Duration::from_millis(800)));
    let _ = s.write_all(b"GET /api/health HTTP/1.0\r\nHost: localhost\r\n\r\n");
    let mut body = String::new();
    let _ = s.read_to_string(&mut body);
    body.contains("\"app\":\"nool\"")
}

fn start_server(app: &tauri::App) -> Result<CommandChild, Box<dyn std::error::Error>> {
    let data = app.path().app_data_dir()?;
    std::fs::create_dir_all(&data)?;
    let resources = app.path().resource_dir()?;
    let node = std::env::current_exe()?.with_file_name(if cfg!(windows) { "nool-node.exe" } else { "nool-node" });
    let path = |p: &std::path::Path| p.to_string_lossy().to_string();

    let mut cmd = app
        .shell()
        .sidecar("nool-node")?
        .args([path(&resources.join("server").join("index.js"))])
        .env("PORT", PORT.to_string())
        .env("HOST", "127.0.0.1")
        .env("ORIGIN", format!("http://localhost:{PORT}"))
        .env("NODE_NO_WARNINGS", "1")
        .env("NOOL_DESKTOP", "1")
        .env("NOOL_DATA_DIR", path(&data))
        .env("NOOL_RESOURCES", path(&resources))
        .env("NOOL_NODE", path(&node));

    // The Google Drive OAuth client is added at build time from CI secrets, never stored in the repo.
    if let Some(id) = option_env!("GOOGLE_CLIENT_ID") {
        cmd = cmd.env("GOOGLE_CLIENT_ID", id);
    }
    if let Some(secret) = option_env!("GOOGLE_CLIENT_SECRET") {
        cmd = cmd.env("GOOGLE_CLIENT_SECRET", secret);
    }

    let (_events, child) = cmd.spawn()?;
    Ok(child)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            let link = args.iter().find(|a| a.starts_with("nool://")).cloned().unwrap_or_default();
            open_link(app, &link);
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Installers register nool:// themselves; this covers running a dev build on Windows and Linux.
            #[cfg(any(windows, target_os = "linux"))]
            let _ = app.deep_link().register_all();
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |e| {
                if let Some(u) = e.urls().first() {
                    open_link(&handle, u.as_str());
                }
            });
            let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Nool")
                .inner_size(1280.0, 840.0)
                .min_inner_size(380.0, 560.0)
                .build()?;

            let mut child = None;
            let mut blocked = false;
            if !nool_running() {
                if connect().is_some() {
                    blocked = true; // something else holds the port
                } else {
                    child = Some(start_server(app)?);
                }
            }
            app.manage(Server(Mutex::new(child)));

            std::thread::spawn(move || {
                if !blocked {
                    for _ in 0..300 {
                        if nool_running() {
                            let url = Url::parse(&format!("http://localhost:{PORT}/")).unwrap();
                            let _ = window.navigate(url);
                            return;
                        }
                        std::thread::sleep(Duration::from_millis(100));
                    }
                }
                // Give the loading page a moment to load before showing the error.
                std::thread::sleep(Duration::from_millis(500));
                let kind = if blocked { "port" } else { "start" };
                let _ = window.eval(&format!("window.noolError && window.noolError('{kind}')"));
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("failed to start Nool")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                if let Some(server) = app.try_state::<Server>() {
                    if let Some(child) = server.0.lock().unwrap().take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}
