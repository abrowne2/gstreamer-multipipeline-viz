use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex;
use tokio_tungstenite::{accept_async, WebSocketStream};
use tokio_tungstenite::tungstenite::Message;
use futures::{StreamExt, SinkExt}; 
use std::collections::HashMap;
use std::sync::Arc;
use rand::Rng;
use serde_json::{from_str, Value};

pub struct MultipipelineVizServer {
    addr: String,
    web_clients: Arc<Mutex<HashMap<String, Arc<Mutex<WebSocketStream<TcpStream>>>>>>, /* You can have more than one web client connected */
    gstreamer_already_connected: Arc<Mutex<bool>>,
    gstreamer_client_id: Arc<Mutex<Option<String>>>
}

impl MultipipelineVizServer {
    fn new(addr: String, web_clients: Arc<Mutex<HashMap<String, Arc<Mutex<WebSocketStream<TcpStream>>>>>>) -> Self {
        MultipipelineVizServer {
            addr,
            web_clients,
            gstreamer_already_connected: Arc::new(Mutex::new(false)),
            gstreamer_client_id: Arc::new(Mutex::new(None))
        }
    }

    // Generates a random client ID for the connected web client, if it does not exist (and is not gstreamer.)
    pub async fn generate_client_id(&self) -> String {
        let mut rng = rand::thread_rng();
        let mut client_id = String::new();
        let web_clients = self.web_clients.lock().await;
        loop {
            for _ in 0..10 {
                let num = rng.gen_range(0..10);
                client_id.push_str(&num.to_string());
            }
            if !web_clients.contains_key(&client_id) {
                break;
            }
            client_id.clear();
        }
        client_id
    }

    async fn start(&mut self) {
        let listener = TcpListener::bind(&self.addr).await.unwrap();
        println!("Gstreamer multipipeline visualizer started at {}", self.addr);
        let web_clients = Arc::clone(&self.web_clients);
        
        loop {
            let gstreamer_already_connected = Arc::clone(&self.gstreamer_already_connected);
            let current_gstreamer_id = Arc::clone(&self.gstreamer_client_id);

            let (stream, _) = listener.accept().await.unwrap();
            // We use the client identifier for sending to any tabs you have open.
            let client_id_clone = self.generate_client_id().await;
            let web_clients = Arc::clone(&web_clients);
            
            tokio::spawn(async move {
                let websocket = accept_async(stream).await.unwrap();
                let socket = Arc::new(Mutex::new(websocket));
                web_clients.lock().await.insert(client_id_clone.clone(), Arc::clone(&socket));
            
                println!("WebSocket connection established");
            
                let mut webclient_socket = socket.lock().await;
                while let Some(msg) = webclient_socket.next().await {
                    match msg {
                        Ok(Message::Text(text)) => {
                            match from_str::<Value>(&text) {
                                Ok(json) => {
                                    if json.get("is_gstreamer").map_or(false, |v| v.as_bool().unwrap_or(false)) {
                                        println!("Gstreamer was connected, assigning it's client ID.");
                                        *gstreamer_already_connected.lock().await = true;
                                        *current_gstreamer_id.lock().await = Some(client_id_clone.clone());

                                        // Gstreamer should not get it's own messages back.
                                        web_clients.lock().await.remove(&client_id_clone);
                                    }

                                    // We are gstreamer, route all messages 
                                    if client_id_clone == *current_gstreamer_id.lock().await.as_ref().unwrap_or(&String::new()) {
                                        let mut clients = web_clients.lock().await;
                                        for client in clients.values() {
                                            
                                            // how to build the trace model?
                                            let mut client = client.lock().await;
                                            client.send(Message::Text(text.clone())).await.unwrap();
                                        }
                                    }
                                }
                                Err(e) => {
                                    println!("Error parsing JSON: {}", e);
                                }
                            }
                        }
                        Ok(Message::Close(_)) => {
                            println!("Received socket close message");
                            break;
                        }
                        Ok(_) => {}
                        Err(e) => {
                            println!("Error reading message: {}", e);
                        }
                    }
                }

                web_clients.lock().await.remove(&client_id_clone);
                println!("WebSocket connection closed");
            });
        }
    }
}