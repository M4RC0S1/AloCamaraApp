import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const querySchema = z.object({
  tipo: z.enum(['Sessão', 'Audiência', 'Comissão']).optional(),
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(), // ex.: 2026-02
});

export function eventosRoutes(db: Db) {
  const r = Router();
  r.use(requireAuth);

  r.get('/', (req, res) => {
    const { tipo = null, mes = null } = querySchema.parse(req.query);
    res.json(
      db
        .prepare('SELECT * FROM eventos WHERE (? IS NULL OR tipo = ?) AND (? IS NULL OR substr(data_hora, 1, 7) = ?) ORDER BY data_hora')
        .all(tipo, tipo, mes, mes),
    );
  });

  return r;
}
