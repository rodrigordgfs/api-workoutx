import fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./src/routes/index.js";
import environment from "./src/config/envs.js";
// import redisCache from './libs/redis.js'

const app = fastify({
  // logger: true,
  pluginTimeout: 60000
});

// app.register(redisCache);
app.register(cors, {
  origin: "*",
});
app.register(routes);

app
  .listen({ port: environment.port, host: "0.0.0.0" })
  .then(() => {
    console.log(`Server is running on port ${environment.port}`);
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
