import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Db = Database.Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS chamados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  endereco TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em análise' CHECK (status IN ('Em análise','Respondido','Concluído')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chamados_user ON chamados(user_id);
CREATE TABLE IF NOT EXISTS respostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id INTEGER NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  mensagem TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS politicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  partido TEXT NOT NULL,
  regiao TEXT NOT NULL,
  bio TEXT
);
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  politico_id INTEGER NOT NULL REFERENCES politicos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (politico_id, user_id)
);
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  local TEXT NOT NULL,
  participantes INTEGER NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('Sessão','Audiência','Comissão'))
);
CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'chamado',
  lida INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notificacoes(user_id);
`;

export function openDb(file: string): Db {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}
