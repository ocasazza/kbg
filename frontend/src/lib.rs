mod app;
mod app_graph;
mod utils;
mod ui;
mod renderer;
mod layout;
mod file_parser;

#[cfg(target_arch = "wasm32")]
mod web {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    pub fn start(canvas_id: &str) -> Result<(), JsValue> {
        // Initialize logger for WebAssembly
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        
        // Start the web app
        let web_options = eframe::WebOptions::default();
        
        wasm_bindgen_futures::spawn_local(async move {
            eframe::start_web(
                canvas_id,
                web_options,
                Box::new(|cc| Box::new(crate::app::App::default())),
            )
            .await
            .expect("Failed to start eframe");
        });
        
        Ok(())
    }
}

// Re-export the start function for wasm
#[cfg(target_arch = "wasm32")]
pub use web::start;
