import { Router } from 'express';
import type { Db } from '../db.js';
import { HttpError } from '../http.js';
import { requireAuth } from '../middleware/auth.js';
import { parseId } from './chamados.js';

export function notificacoesRoutes(db: Db) {
  const r = Router();
  r.use(requireAuth);

  r.get('/', (req, res) => {
    const soNaoLidas = req.query.lida === 'false' ? 1 : 0;
    res.json(db.prepare('SELECT * FROM notificacoes WHERE user_id = ? AND (? = 0 OR lida = 0) ORDER BY created_at DESC, id DESC').all(req.auth!.id, soNaoLidas));
  });

  r.post('/marcar-todas-lidas', (req, res) => {
    const { changes } = db.prepare('UPDATE notificacoes SET lida = 1 WHERE user_id = ? AND lida = 0').run(req.auth!.id);
    res.json({ atualizadas: changes });
  });

  r.patch('/:id/lida', (req, res) => {
    const { changes } = db.prepare('UPDATE notificacoes SET lida = 1 WHERE id = ? AND user_id = ?').run(parseId(req.params.id), req.auth!.id);
    if (!changes) throw new HttpError(404, 'Notificação não encontrada');
    res.status(204).end();
  });

  return r;
}
