import { redisClient } from '#libs/redis';
import { Plan, User } from '#types/types';

export const stats = async (plan: Plan, user: User) => {
  const monthKey = `plan_${plan.id}_month:${user.id}`;
  const consumedRaw = await redisClient.get(monthKey);
  const consumed = consumedRaw ? parseInt(consumedRaw, 10) : 0;
  const limit = plan.limit_per_month;

  return { consumed: consumed > limit ? limit : consumed, limit };
};
