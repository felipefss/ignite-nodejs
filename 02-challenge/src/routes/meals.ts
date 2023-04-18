import { type FastifyInstance } from 'fastify';

import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { checkSession } from '../middlewares/checkSession';

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSession] }, async (request) => {
    const { sessionId } = request.cookies;
    const meals = await knex('meals').select().where('session_id', sessionId);

    return meals;
  });

  app.get('/:id', { preHandler: [checkSession] }, async (request) => {
    const getParamsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = getParamsSchema.parse(request.params);
    const { sessionId } = request.cookies;

    const meal = await knex('meals')
      .select()
      .where({ session_id: sessionId, id })
      .first();

    return { meal };
  });

  app.put('/:id', { preHandler: [checkSession] }, async (request, reply) => {
    const getParamsSchema = z.object({
      id: z.string().uuid()
    });

    const getUpdateSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      inDiet: z.boolean()
    });

    const { inDiet, name, description } = getUpdateSchema.parse(request.body);

    const { id } = getParamsSchema.parse(request.params);
    const { sessionId } = request.cookies;

    await knex('meals').where({ session_id: sessionId, id }).update({
      name,
      description,
      in_diet: inDiet
    });

    return await reply.status(200).send();
  });

  app.post('/', async (request, reply) => {
    const mealSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      inDiet: z.boolean().default(false)
    });

    const { inDiet, name, description } = mealSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (sessionId == null) {
      sessionId = randomUUID();

      void reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      in_diet: inDiet,
      session_id: sessionId
    });

    return await reply.status(201).send();
  });

  app.delete('/:id', async (request, reply) => {
    const getParamsSchema = z.object({
      id: z.string().uuid()
    });

    const { id } = getParamsSchema.parse(request.params);
    const { sessionId } = request.cookies;

    await knex('meals')
      .where({
        session_id: sessionId,
        id
      })
      .delete();

    return await reply.status(204).send();
  });

  app.get('/summary', async (request) => {
    const { sessionId } = request.cookies;

    const meals = await knex('meals')
      .where('session_id', sessionId)
      .orderBy('created_at')
      .select();

    const totalMealsInDiet = meals.filter((meal) =>
      Boolean(meal.in_diet)
    ).length;
    const totalMeals = meals.length;

    const bestStreak = meals.reduce((sum, meal) => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(meal.in_diet)) {
        return 0;
      }

      return sum + 1;
    }, 0);

    return {
      total: totalMeals,
      inDiet: totalMealsInDiet,
      offDiet: totalMeals - totalMealsInDiet,
      bestStreak
    };
  });
}
