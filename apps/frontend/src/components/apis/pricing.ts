import type { ApiPlan } from '@/data/plans';
import { numberFormat } from '@/lib/format';

export type BillingInterval = 'month' | 'year';

export const formatCents = (cents: number, decimals = 2) => {
  const value = cents / 100;
  return value % 1 === 0
    ? `$${numberFormat(value)}`
    : `$${numberFormat(value, { maximumFractionDigits: decimals })}`;
};

const cents = (value: null | number | undefined) => value ?? 0;

export const isFreePlan = (plan: ApiPlan) =>
  cents(plan.price_monthly) === 0 && cents(plan.price_annually) === 0;

/** A paid plan without a yearly price is sold monthly only. */
export const hasYearly = (plan: ApiPlan) =>
  !isFreePlan(plan) && cents(plan.price_annually) > 0;

/** The interval a plan is actually sold at for the chosen one. */
export const intervalFor = (
  plan: ApiPlan,
  interval: BillingInterval,
): BillingInterval => (hasYearly(plan) ? interval : 'month');

/** Whole-percent saving of yearly billing over twelve monthly payments; 0 when there is none. */
export const yearlySaving = (plan: ApiPlan) => {
  const twelveMonths = cents(plan.price_monthly) * 12;
  const yearly = cents(plan.price_annually);
  if (!hasYearly(plan) || twelveMonths <= 0 || yearly >= twelveMonths) return 0;
  return Math.round((1 - yearly / twelveMonths) * 100);
};

/** The best yearly saving across plans, and whether every saving plan saves the same. */
export const bestYearlySaving = (plans: ApiPlan[]) => {
  const savings = plans.map(yearlySaving).filter((saving) => saving > 0);
  const best = savings.length ? Math.max(...savings) : 0;
  return { best, uniform: savings.every((saving) => saving === best) };
};

/** The dashboard's public checkout page for a plan; sign-in happens there. */
export const checkoutUrl = (
  dashboardUrl: string,
  planId: number,
  interval: BillingInterval,
) =>
  `${dashboardUrl.replace(/\/+$/, '')}/plans/checkout?id=${planId}&interval=${interval}`;
