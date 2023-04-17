import type { FastifyReply, FastifyRequest } from 'fastify';

export async function checkSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (sessionId == null) {
    return await reply.status(401).send({
      error: 'Unauthorized.'
    });
  }
}
