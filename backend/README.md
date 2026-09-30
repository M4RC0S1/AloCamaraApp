# Backend — Alô Câmara

API REST em **Node 22 + TypeScript + Express 5**, banco **SQLite** (`better-sqlite3`), validação com **Zod** e autenticação **JWT**.

## Rodando

```bash
cd backend
npm install
cp .env.example .env      # ajuste JWT_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
npm run seed              # cria políticos/agenda de exemplo e o usuário administrador
npm run dev               # http://localhost:3333
npm test                  # testes de integração (banco em memória)
```

> No app Expo, use o IP da máquina (ex.: `http://192.168.0.10:3333`), não `localhost`, ao testar no celular.

## Endpoints

Todas as rotas `/api/*` (exceto `register` e `login`) exigem `Authorization: Bearer <token>`.
Erros seguem `{ "error": "mensagem" }` (validação inclui `detalhes`).

| Método | Rota | Quem | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | público | Cadastro de cidadão (`name`, `email`, `password` ≥ 8) |
| POST | `/api/auth/login` | público | Retorna `{ token, user }` (cidadão e admin) |
| GET/PATCH | `/api/auth/me` | logado | Perfil / edição de nome e e-mail |
| GET | `/api/chamados?status=` | logado | Cidadão: os seus. Admin: todos |
| POST | `/api/chamados` | cidadão | Abre chamado (`tipo`, `titulo`, `endereco`, `descricao`); gera protocolo `AL2026NNNN` |
| GET | `/api/chamados/:id` | dono/admin | Detalhe + respostas |
| POST | `/api/chamados/:id/respostas` | admin | Responde (`mensagem`, `status?`); notifica o cidadão |
| PATCH | `/api/chamados/:id/status` | admin | `Em análise` \| `Respondido` \| `Concluído` |
| GET | `/api/politicos?regiao=&q=` | logado | Lista com média de avaliações |
| GET | `/api/politicos/:id` | logado | Detalhe + avaliações |
| PUT | `/api/politicos/:id/avaliacao` | cidadão | `nota` 1–5, `comentario?` (uma por cidadão; reenvio atualiza) |
| GET | `/api/eventos?tipo=&mes=YYYY-MM` | logado | Agenda |
| GET | `/api/notificacoes?lida=false` | logado | Notificações do usuário |
| PATCH | `/api/notificacoes/:id/lida` | logado | Marca como lida |
| POST | `/api/notificacoes/marcar-todas-lidas` | logado | Marca todas |

## Decisões e pontos em aberto

- O `documentacao-alo-camara.md` citado no README principal **não está no repositório**; o modelo de dados foi inferido das telas e do `AppContext`. Vale conferir com o time.
- Administradores **não** se cadastram pela API; são criados pelo `npm run seed`.
- Stack (SQLite/Express) é um ponto de partida: para produção, considerar PostgreSQL. As queries ficam isoladas em `src/routes/*`.
- Ainda não implementado: multi-prefeitura/cidades, anexos de fotos nos chamados, push notifications, refresh token, rate limiting.
