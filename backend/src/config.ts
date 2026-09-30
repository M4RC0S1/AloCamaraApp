import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-nao-use-em-producao',
  databaseFile: process.env.DATABASE_FILE ?? './data/alocamara.db',
};
