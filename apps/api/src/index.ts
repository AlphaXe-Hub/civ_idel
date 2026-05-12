import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { getDb } from "./db.js";
import { authRoutes } from "./routes/auth.js";
import { saveRoutes } from "./routes/save.js";

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cookie);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await getDb();

  app.get("/health", async () => ({ ok: true }));

  await authRoutes(app);
  await saveRoutes(app);

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API http://0.0.0.0:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
