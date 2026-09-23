use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Perfil {
    pub id: i64,
    pub pin_hash: Option<String>,
    pub created_at: String,
}
