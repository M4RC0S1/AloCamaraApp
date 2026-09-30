import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { HttpError } from '../http.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { parseId } from './chamados.js';

const avaliacaoSchema = z.object({ nota: z.number().int().min(1).max(5), comentario: z.string().trim().max(500).optional() });

const BASE = `SELECT p.*, ROUND(AVG(a.nota), 1) AS media, COUNT(a.id) AS total_avaliacoes
              FROM politicos p LEFT JOIN avaliacoes a ON a.politico_id = p.id`;

export function politicosRoutes(db: Db) {
  const r = Router();
  r.use(requireAuth);

  r.get('/', (req, res) => {
    const regiao = typeof req.query.regiao === 'string' && req.query.regiao !== 'Todas' ? req.query.regiao : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    res.json(db.prepare(`${BASE} WHERE (? IS NULL OR p.regiao = ?) AND p.nome LIKE ? GROUP BY p.id ORDER BY p.nome`).all(regiao, regiao, `%${q}%`));
  });

  r.get('/:id', (req, res) => {
    const id = parseId(req.params.id);
    const p = db.prepare(`${BASE} WHERE p.id = ? GROUP BY p.id`).get(id);
    if (!p) throw new HttpError(404, 'Político não encontrado');
    const avaliacoes = db
      .prepare('SELECT a.id, a.nota, a.comentario, a.created_at, u.name AS autor FROM avaliacoes a JOIN users u ON u.id = a.user_id WHERE a.politico_id = ? ORDER BY a.created_at DESC LIMIT 50')
      .all(id);
    res.json({ ...p, avaliacoes });
  });

  // Uma avaliação por cidadão por político; reenviar atualiza a anterior
  r.put('/:id/avaliacao', requireRole('user'), (req, res) => {
    const id = parseId(req.params.id);
    if (!db.prepare('SELECT 1 FROM politicos WHERE id = ?').get(id)) throw new HttpError(404, 'Político não encontrado');
    const d = avaliacaoSchema.parse(req.body);
    db.prepare(
      `INSERT INTO avaliacoes (politico_id, user_id, nota, comentario) VALUES (?,?,?,?)
       ON CONFLICT (politico_id, user_id) DO UPDATE SET nota = excluded.nota, comentario = excluded.comentario, created_at = datetime('now')`,
    ).run(id, req.auth!.id, d.nota, d.comentario ?? null);
    res.json(db.prepare(`${BASE} WHERE p.id = ? GROUP BY p.id`).get(id));
  });

  return r;
}
