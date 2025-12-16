import { Pool } from 'pg';

// Create a connection pool
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Use connection string directly for better compatibility with various PostgreSQL providers
    pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });
  }

  return pool;
}

// Initialize database tables
export async function initializeChatTables(): Promise<void> {
  const pool = getDbPool();
  
  try {
    // Create chat_messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        from_email VARCHAR(255) NOT NULL,
        to_email VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        delivered BOOLEAN DEFAULT false,
        read_status BOOLEAN DEFAULT false,
        file_url TEXT,
        file_name VARCHAR(255),
        file_size BIGINT,
        reply_to VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_from_to 
      ON chat_messages(from_email, to_email, timestamp DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_to_from 
      ON chat_messages(to_email, from_email, timestamp DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp 
      ON chat_messages(timestamp DESC)
    `);

    // Create chat_relationships table (for booking-based chats)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_relationships (
        id VARCHAR(255) PRIMARY KEY,
        client_email VARCHAR(255) NOT NULL,
        freelancer_email VARCHAR(255) NOT NULL,
        booking_id VARCHAR(255),
        service_title VARCHAR(500),
        service_id VARCHAR(255),
        package_id VARCHAR(255),
        booking_status VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_email, freelancer_email, booking_id)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_relationships_client 
      ON chat_relationships(client_email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_relationships_freelancer 
      ON chat_relationships(freelancer_email)
    `);

    console.log('[ChatDB] Database tables initialized successfully');
  } catch (error) {
    console.error('[ChatDB] Error initializing database tables:', error);
    throw error;
  }
}

// Close the pool (useful for cleanup)
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

