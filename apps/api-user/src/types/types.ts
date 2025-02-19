import { Request } from 'express';
import { SafeParseSuccess } from 'zod';

import { VerificationKind } from '#types/enums';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  adminUsername: string;
  awsUrl: string;
  dbUrl: string;
  jwtSecret: string;
  logoUrl: string;
  network: string;
  port: number;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelPassword: string;
  redisSentinelUrls: string;
  redisUrl: string;
  sentryDsn?: string;
  sesAccessKey: string;
  sesEmailFrom: string;
  sesRegion: string;
  sesSecretKey: string;
};

export type Campaign = {
  api_subscription_id: number;
  click_count: number;
  desktop_image_center: string;
  desktop_image_right: string;
  icon: string;
  id: number;
  impression_count: number;
  is_active: boolean;
  is_approved: boolean;
  link_name: string;
  mobile_image: string;
  site_name: string;
  start_date: string;
  text: string;
  title: string;
  url: string;
};

export type User = {
  email: string;
  id: number;
  keys?: Key[];
  last_login_at: string;
  password: string;
  plan?: Plan;
  salt: string;
  stripe_cid?: string;
  username: string;
  verification?: Verification;
  verified: boolean;
};

export type Plan = {
  id: number;
  limit_per_day: number;
  limit_per_minute: number;
  limit_per_month: number;
  limit_per_second: number;
  price_annually: number;
  price_monthly: number;
  stripe_mpid?: string;
  stripe_pid?: string;
  stripe_ypid?: string;
  title: string;
};

export type Key = {
  created_at: string;
  id: number;
  name: string;
  token: number;
  updated_at: string;
  user?: User;
};

export type Verification = {
  code: string;
  created_at: string;
  email: string;
  expires_at: string;
  id: number;
  type: VerificationKind;
  user?: User;
};

export type ValidationError = {
  message: string;
  path: string;
};
