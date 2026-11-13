import { cache } from 'react';

type ApiPlan = {
  id: number;
  limit_per_day: null | number;
  limit_per_minute: null | number;
  limit_per_month: null | number;
  limit_per_second: null | number;
  price_annually: null | number;
  price_monthly: null | number;
  title: string;
};

type PlansRes = {
  data: ApiPlan[];
};

export type { ApiPlan };

export const fetchPlans = cache(async (): Promise<ApiPlan[]> => {
  try {
    const res = await fetch('https://api.exploreblocks.io/v2/api/plans');
    if (!res.ok) return [];
    const resp = (await res.json()) as PlansRes;
    return resp.data;
  } catch {
    return [];
  }
});
