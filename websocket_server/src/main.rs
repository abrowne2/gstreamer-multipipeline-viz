pub mod socket_mgr;

use crate::socket_mgr::MultipipelineVizServer;

#[tokio::main]
async fn main() {
    let server = MultiPipelineServer::new("127.0.0.1:8080".to_string());
    server.start().await;
}