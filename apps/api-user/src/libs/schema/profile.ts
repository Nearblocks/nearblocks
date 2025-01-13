import { z } from 'zod';

const email = z.object({ email: z.string().email() });

const updateEmail = z.object({
  code: z.string().max(32),
  email: z.string().email(),
});

const password = z
  .object({
    confirm_password: z.string().trim().min(8).max(100),
    old_password: z.string().trim().min(8).max(100),
    password: z.string().trim().min(8).max(100),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

const destroy = z.object({
  password: z.string().trim().min(8).max(100),
});

export type Email = z.infer<typeof email>;
export type UpdateEmail = z.infer<typeof updateEmail>;
export type Password = z.infer<typeof password>;
export type Destroy = z.infer<typeof destroy>;

export default { destroy, email, password, updateEmail };
