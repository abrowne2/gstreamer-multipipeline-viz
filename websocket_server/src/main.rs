use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;

#[tokio::main]
async fn main() {
    let addr = "127.0.0.1:8080";
    let listener = TcpListener::bind(addr).await.unwrap();
    println!("Gstreamer multipipeline visualizer started at {}", addr);

    loop {
        let (stream, _) = listener.accept().await.unwrap();
        tokio::spawn(async move {
            let mut websocket = accept_async(stream).await.unwrap();
            println!("WebSocket connection established");

            while let Ok(msg) = websocket.read_message().await {
                match msg {
                    Message::Text(text) => {
                        println!("Received message: {}", text);
                        // Handle the received message here
                    }
                    Message::Binary(_) => {
                        // Handle binary message if needed
                    }
                    Message::Ping(_) => {
                        // Handle ping message if needed
                    }
                    Message::Pong(_) => {
                        // Handle pong message if needed
                    }
                    Message::Close(_) => {
                        // Handle close message if needed
                        break;
                    }
                }
            }

            println!("WebSocket connection closed");
        });
    }
}