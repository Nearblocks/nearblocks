import { z } from 'zod';

const register = z
  .object({
    confirm_email: z.string().email(),
    confirm_password: z.string().trim().min(8).max(100),
    email: z.string().email(),
    password: z.string().trim().min(8).max(100),
    username: z
      .string()
      .trim()
      .min(5)
      .max(30)
      .regex(/^[a-z0-9]+$/i, 'Invalid username'),
  })
  .refine((data) => data.email === data.confirm_email, {
    message: "Emails don't match",
    path: ['confirm_email'],
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

const resend = z.object({
  email: z.string().email(),
});

const verify = z.object({
  code: z.string().max(32),
  email: z.string().email(),
});

const login = z.object({
  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(100, { message: 'Password must not exceed 100 characters.' }),
  remember: z.boolean().optional(),
  username_or_email: z
    .string()
    .trim()
    .min(5, {
      message: 'Username or email must be at least 5 characters long.',
    }),
});

const forgot = z.object({
  email: z.string().email(),
});

const reset = z
  .object({
    code: z.string().max(32),
    confirm_password: z.string().trim().min(8).max(100),
    email: z.string().email(),
    password: z.string().trim().min(8).max(100),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

const walletlogin = z.object({
  accountId: z.string(),
  public_key: z.string(),
  signature: z.string(),
});

export type Register = z.infer<typeof register>;
export type Resend = z.infer<typeof resend>;
export type Verify = z.infer<typeof verify>;
export type Login = z.infer<typeof login>;
export type Forgot = z.infer<typeof forgot>;
export type walletlogin = z.infer<typeof walletlogin>;
export type Reset = z.infer<typeof reset>;

export default { forgot, login, register, resend, reset, verify, walletlogin };
