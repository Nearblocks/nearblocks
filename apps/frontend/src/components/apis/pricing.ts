import type { ApiPlan } from '@/data/plans';
import { numberFormat } from '@/lib/format';

export type BillingInterval = 'month' | 'year';

const DASHBOARD_URL = 'https://dash.nearblocks.io';

export const formatCents = (cents: number, decimals = 2) => {
  const value = cents / 100;
  return value % 1 === 0
    ? `$${numberFormat(value)}`
    : `$${numberFormat(value, { maximumFractionDigits: decimals })}`;
};

export const isFreePlan = (plan: ApiPlan) =>
  plan.price_monthly === 0 && plan.price_annually === 0;

/** Whole-percent saving of yearly billing over twelve monthly payments; 0 when there is none. */
export const yearlySaving = (plan: ApiPlan) => {
  const twelveMonths = plan.price_monthly * 12;
  if (twelveMonths <= 0 || plan.price_annually >= twelveMonths) return 0;
  return Math.round((1 - plan.price_annually / twelveMonths) * 100);
};

/** The best yearly saving across plans, and whether every paid plan saves the same. */
export const bestYearlySaving = (plans: ApiPlan[]) => {
  const savings = plans.map(yearlySaving).filter((saving) => saving > 0);
  const best = savings.length ? Math.max(...savings) : 0;
  return { best, uniform: savings.every((saving) => saving === best) };
};

/** The dashboard's public checkout page for a plan; sign-in happens there. */
export const checkoutUrl = (planId: number, interval: BillingInterval) =>
  `${DASHBOARD_URL}/plans/checkout?id=${planId}&interval=${interval}`;
