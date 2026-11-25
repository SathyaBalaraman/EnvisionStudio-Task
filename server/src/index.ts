import { createApp } from './app.ts';
import { openDatabase } from './db.ts';
const db = openDatabase(process.env.DB_PATH ?? './data/taskflow.db');
const port = Number(process.env.PORT ?? 3001);
const server = createApp(db).listen(port, '0.0.0.0', () => console.log(`TaskFlow API listening on port ${port}`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
