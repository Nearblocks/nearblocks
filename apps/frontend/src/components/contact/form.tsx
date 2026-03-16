'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContactForm } from '@/actions/contact';
import { useConfig } from '@/hooks/use-config';
import { type ContactFormValues } from '@/lib/schema/contact';
import { Button } from '@/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/ui/field';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';

type Props = {
  subject: string;
};

export const ContactForm = ({ subject }: Props) => {
  const turnstileSiteKey = useConfig((state) => state.config.turnstileSiteKey);
  const tokenRef = useRef<string>('');
  const [submitting, setSubmitting] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactFormValues>();

  const onSubmit = async (values: ContactFormValues) => {
    if (!tokenRef.current) {
      toast.error('Please complete the captcha');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitContactForm({
        description: values.description,
        email: values.email,
        name: values.name,
        subject,
        token: tokenRef.current,
      });

      if (result.success) {
        toast.success(result.data?.message ?? 'Message sent successfully');
        reset();
        tokenRef.current = '';
      } else {
        toast.error(result.error ?? 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="mt-6 flex flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldSet>
        <div className="flex flex-col gap-6 md:flex-row">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldContent>
              <Input
                aria-invalid={!!errors.name}
                id="name"
                placeholder="Enter name..."
                {...register('name', { required: 'Name is required' })}
              />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                aria-invalid={!!errors.email}
                id="email"
                placeholder="Enter email..."
                type="email"
                {...register('email', {
                  pattern: {
                    message: 'Invalid email address',
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  },
                  required: 'Email is required',
                })}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </FieldContent>
          </Field>
        </div>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea
              aria-invalid={!!errors.description}
              id="message"
              placeholder="Max characters (300 words)"
              rows={6}
              {...register('description', {
                maxLength: {
                  message: 'Message must be under 1500 characters',
                  value: 1500,
                },
                required: 'Message is required',
              })}
            />
            <FieldError
              errors={errors.description ? [errors.description] : []}
            />
          </FieldContent>
        </Field>
      </FieldSet>

      <Turnstile
        onSuccess={(token) => {
          tokenRef.current = token;
        }}
        siteKey={turnstileSiteKey}
      />

      <div>
        <Button disabled={submitting} type="submit" variant="secondary">
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};
