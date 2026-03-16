import * as z from 'zod/v4/mini';

export const contactFormSchema = z.object({
  description: z
    .string()
    .check(
      z.minLength(1, 'Message is required'),
      z.maxLength(1500, 'Message must be under 1500 characters'),
    ),
  email: z.email(),
  name: z.string().check(z.minLength(1, 'Name is required')),
});

export const contactSchema = z.object({
  ...contactFormSchema.shape,
  subject: z.string().check(z.minLength(1, 'Subject is required')),
  token: z.string().check(z.minLength(1, 'Captcha token is missing')),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
