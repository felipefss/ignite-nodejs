/* eslint-disable @typescript-eslint/no-floating-promises */
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { mealRoutes } from './routes/meals';

const server = fastify();

server.register(cookie);
server.register(mealRoutes, { prefix: '/meals' });

server
  .listen({ port: 3333 })
  .then((address) => {
    console.log(`Server listening at ${address}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
