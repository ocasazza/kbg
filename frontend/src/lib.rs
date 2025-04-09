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
    use eframe::wasm_bindgen;

    #[wasm_bindgen]
    pub fn start(canvas_id: &str) -> Result<(), JsValue> {
        // Initialize logger for WebAssembly
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        
        // Initialize the application
        let app = crate::app::App::default();
        
        // Clone the canvas_id to avoid lifetime issues
        let canvas_id = canvas_id.to_owned();
        
        // Start the web app
        eframe::start_web(canvas_id, Box::new(|_cc| Box::new(app)))
            .expect("Failed to start eframe");
        
        Ok(())
    }
}

// Re-export the start function for wasm
#[cfg(target_arch = "wasm32")]
pub use web::start;
