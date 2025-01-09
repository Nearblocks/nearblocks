import { Key, Plan, User } from '#types/types';

export const transformUser = ({
  email,
  id,
  keys = [],
  last_login_at,
  plan,
  username,
  verified,
}: User) => {
  const transformedPlan = plan ? transformPlan(plan) : null;
  const transformedKeys = keys.map((key) => transformKey(key));

  return {
    email,
    id,
    keys: transformedKeys,
    last_login_at,
    plan: transformedPlan,
    username,
    verified,
  };
};

export const transformPlans = (plans: Plan[]) =>
  plans.map((plan) => transformPlan(plan));

export const transformPlan = ({
  id,
  limit_per_day,
  limit_per_minute,
  limit_per_month,
  limit_per_second,
  price_annually,
  price_monthly,
  title,
}: Plan) => ({
  id,
  limit_per_day,
  limit_per_minute,
  limit_per_month,
  limit_per_second,
  price_annually,
  price_monthly,
  title,
});

export const transformKeys = (keys: Key[]) =>
  keys.map((key) => transformKey(key));

export const transformKey = ({
  created_at,
  id,
  name,
  token,
  updated_at,
}: Key) => ({
  created_at,
  id,
  name,
  token,
  updated_at,
});
