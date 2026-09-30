import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Db } from '../db.js';
import { HttpError } from '../http.js';
import { requireAuth, signToken, type Role } from '../middleware/auth.js';

type UserRow = { id: number; name: string; email: string; password_hash: string; role: Role };

const publicUser = (u: UserRow) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

const email = z.email().transform(e => e.toLowerCase());
const registerSchema = z.object({ name: z.string().trim().min(2), email, password: z.string().min(8) });
const loginSchema = z.object({ email, password: z.string().min(1) });
const profileSchema = z.object({ name: z.string().trim().min(2).optional(), email: email.optional() });

export function authRoutes(db: Db) {
  const r = Router();

  // Cadastro público: sempre cria cidadão. Administradores são criados via `npm run seed`.
  r.post('/register', (req, res) => {
    const d = registerSchema.parse(req.body);
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(d.email)) throw new HttpError(409, 'E-mail já cadastrado');
    const id = Number(
      db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)').run(d.name, d.email, bcrypt.hashSync(d.password, 10)).lastInsertRowid,
    );
    res.status(201).json({ token: signToken({ id, role: 'user' }), user: { id, name: d.name, email: d.email, role: 'user' } });
  });

  r.post('/login', (req, res) => {
    const d = loginSchema.parse(req.body);
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(d.email) as UserRow | undefined;
    if (!u || !bcrypt.compareSync(d.password, u.password_hash)) throw new HttpError(401, 'E-mail ou senha inválidos');
    res.json({ token: signToken({ id: u.id, role: u.role }), user: publicUser(u) });
  });

  r.get('/me', requireAuth, (req, res) => {
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth!.id) as UserRow | undefined;
    if (!u) throw new HttpError(401, 'Usuário não encontrado');
    res.json(publicUser(u));
  });

  r.patch('/me', requireAuth, (req, res) => {
    const d = profileSchema.parse(req.body);
    const id = req.auth!.id;
    if (d.email && db.prepare('SELECT 1 FROM users WHERE email = ? AND id <> ?').get(d.email, id)) throw new HttpError(409, 'E-mail já cadastrado');
    db.prepare('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?').run(d.name ?? null, d.email ?? null, id);
    res.json(publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow));
  });

  return r;
}
