-- Better Auth tables (Faz 1)
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  role text NOT NULL DEFAULT 'customer',
  phone text,
  wordpress_customer_id text,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verifications (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);
