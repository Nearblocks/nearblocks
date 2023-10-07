import { Key, Plan, User } from '#ts/types';

export const transformUser = ({
  id,
  email,
  username,
  verified,
  last_login_at,
  plan,
  keys = [],
}: User) => {
  const transformedPlan = plan ? transformPlan(plan) : null;
  const transformedKeys = keys.map((key) => transformKey(key));

  return {
    id,
    email,
    username,
    verified,
    last_login_at,
    plan: transformedPlan,
    keys: transformedKeys,
  };
};

export const transformPlans = (plans: Plan[]) =>
  plans.map((plan) => transformPlan(plan));

export const transformPlan = ({
  id,
  title,
  limit_per_second,
  limit_per_minute,
  limit_per_day,
  limit_per_month,
  price_monthly,
  price_annually,
}: Plan) => ({
  id,
  title,
  limit_per_second,
  limit_per_minute,
  limit_per_day,
  limit_per_month,
  price_monthly,
  price_annually,
});

export const transformKeys = (keys: Key[]) =>
  keys.map((key) => transformKey(key));

export const transformKey = ({
  id,
  name,
  token,
  created_at,
  updated_at,
}: Key) => ({
  id,
  name,
  token,
  created_at,
  updated_at,
});
