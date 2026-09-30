import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { HttpError } from '../http.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const STATUS = ['Em análise', 'Respondido', 'Concluído'] as const;

const createSchema = z.object({
  tipo: z.string().trim().min(1),
  titulo: z.string().trim().min(3),
  endereco: z.string().trim().min(1),
  descricao: z.string().trim().min(5),
});
const respostaSchema = z.object({ mensagem: z.string().trim().min(1), status: z.enum(STATUS).optional() });
const statusSchema = z.object({ status: z.enum(STATUS) });

type Row = { id: number; user_id: number; status: string; protocolo: string };

export const parseId = (v: unknown) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'ID inválido');
  return n;
};

export function chamadosRoutes(db: Db) {
  const r = Router();
  r.use(requireAuth);

  const load = (id: number, auth: { id: number; role: string }) => {
    const c = db.prepare('SELECT c.*, u.name AS cidadao FROM chamados c JOIN users u ON u.id = c.user_id WHERE c.id = ?').get(id) as Row | undefined;
    // 404 (e não 403) para não revelar a existência de chamados de outros usuários
    if (!c || (auth.role !== 'admin' && c.user_id !== auth.id)) throw new HttpError(404, 'Chamado não encontrado');
    return c;
  };

  const notify = (userId: number, titulo: string, mensagem: string) =>
    db.prepare('INSERT INTO notificacoes (user_id, titulo, mensagem) VALUES (?,?,?)').run(userId, titulo, mensagem);

  // Cidadão vê os seus; administrador vê todos (filtro opcional ?status=)
  r.get('/', (req, res) => {
    const status = req.query.status ? z.enum(STATUS).parse(req.query.status) : null;
    const admin = req.auth!.role === 'admin' ? 1 : 0;
    res.json(
      db
        .prepare(
          `SELECT c.*, u.name AS cidadao FROM chamados c JOIN users u ON u.id = c.user_id
           WHERE (? = 1 OR c.user_id = ?) AND (? IS NULL OR c.status = ?) ORDER BY c.created_at DESC, c.id DESC`,
        )
        .all(admin, req.auth!.id, status, status),
    );
  });

  r.post('/', requireRole('user'), (req, res) => {
    const d = createSchema.parse(req.body);
    const id = db.transaction(() => {
      const newId = Number(
        db.prepare('INSERT INTO chamados (user_id, tipo, titulo, endereco, descricao) VALUES (?,?,?,?,?)').run(req.auth!.id, d.tipo, d.titulo, d.endereco, d.descricao).lastInsertRowid,
      );
      db.prepare('UPDATE chamados SET protocolo = ? WHERE id = ?').run(`AL${new Date().getFullYear()}${String(newId).padStart(4, '0')}`, newId);
      return newId;
    })();
    res.status(201).json(load(id, req.auth!));
  });

  r.get('/:id', (req, res) => {
    const c = load(parseId(req.params.id), req.auth!);
    const respostas = db
      .prepare('SELECT r.id, r.mensagem, r.created_at, u.name AS autor FROM respostas r JOIN users u ON u.id = r.admin_id WHERE r.chamado_id = ? ORDER BY r.id')
      .all(c.id);
    res.json({ ...c, respostas });
  });

  // Prefeitura responde; opcionalmente já atualiza o status (padrão: "Respondido")
  r.post('/:id/respostas', requireRole('admin'), (req, res) => {
    const c = load(parseId(req.params.id), req.auth!);
    const d = respostaSchema.parse(req.body);
    db.transaction(() => {
      db.prepare('INSERT INTO respostas (chamado_id, admin_id, mensagem) VALUES (?,?,?)').run(c.id, req.auth!.id, d.mensagem);
      db.prepare("UPDATE chamados SET status = ?, updated_at = datetime('now') WHERE id = ?").run(d.status ?? 'Respondido', c.id);
      notify(c.user_id, 'Chamado respondido', `Seu chamado ${c.protocolo} recebeu uma resposta da prefeitura.`);
    })();
    res.status(201).json(load(c.id, req.auth!));
  });

  r.patch('/:id/status', requireRole('admin'), (req, res) => {
    const c = load(parseId(req.params.id), req.auth!);
    const { status } = statusSchema.parse(req.body);
    db.transaction(() => {
      db.prepare("UPDATE chamados SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, c.id);
      if (status !== c.status) notify(c.user_id, 'Status atualizado', `Seu chamado ${c.protocolo} agora está: ${status}.`);
    })();
    res.json(load(c.id, req.auth!));
  });

  return r;
}
