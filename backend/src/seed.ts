import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { openDb, type Db } from './db.js';

const politicos = [
  ['Maria Silva Santos', 'Partido A', 'Centro'],
  ['João Pedro Costa', 'Partido B', 'Norte'],
  ['Ana Carolina Lima', 'Partido C', 'Sul'],
  ['Carlos Alberto Souza', 'Partido D', 'Leste'],
  ['Beatriz Oliveira', 'Partido E', 'Oeste'],
];
const eventos = [
  ['Sessão Ordinária da Câmara', '2026-02-27T14:00', 'Plenário Principal', 15, 'Sessão'],
  ['Audiência Pública - Transporte', '2026-02-28T09:00', 'Auditório', 45, 'Audiência'],
  ['Comissão de Infraestrutura', '2026-03-01T10:00', 'Sala de Reuniões 2', 8, 'Comissão'],
];

const isEmpty = (db: Db, table: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n === 0;

// Idempotente: só popula tabelas vazias e ignora admin já existente.
export function seed(db: Db, admin?: { email: string; password: string }) {
  if (isEmpty(db, 'politicos')) {
    const p = db.prepare('INSERT INTO politicos (nome, partido, regiao) VALUES (?,?,?)');
    politicos.forEach(v => p.run(...v));
  }
  if (isEmpty(db, 'eventos')) {
    const e = db.prepare('INSERT INTO eventos (titulo, data_hora, local, participantes, tipo) VALUES (?,?,?,?,?)');
    eventos.forEach(v => e.run(...v));
  }
  if (admin) {
    db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Prefeitura', ?, ?, 'admin') ON CONFLICT (email) DO NOTHING").run(
      admin.email.toLowerCase(),
      bcrypt.hashSync(admin.password, 10),
    );
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (veja .env.example)');
  seed(openDb(config.databaseFile), { email, password });
  console.log(`Seed concluído. Admin: ${email}`);
}
