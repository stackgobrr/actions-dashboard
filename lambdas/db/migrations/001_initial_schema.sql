CREATE TABLE IF NOT EXISTS users (
  github_id       BIGINT PRIMARY KEY,
  login           TEXT NOT NULL,
  avatar_url      TEXT,
  github_token    TEXT,
  installation_id BIGINT,
  settings        JSONB NOT NULL DEFAULT '{}',
  selected_repos  JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_by  BIGINT NOT NULL REFERENCES users(github_id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id    BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  github_id   BIGINT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, github_id)
);

CREATE TABLE IF NOT EXISTS group_configs (
  group_id    BIGINT PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  config      JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
