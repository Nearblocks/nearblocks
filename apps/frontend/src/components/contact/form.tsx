'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContactForm } from '@/actions/contact';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
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
  const { t } = useLocale('contact');
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
      toast.error(t('form.captchaError'));
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
            <FieldLabel htmlFor="name">{t('form.nameLabel')}</FieldLabel>
            <FieldContent>
              <Input
                aria-invalid={!!errors.name}
                id="name"
                placeholder={t('form.namePlaceholder')}
                {...register('name', { required: t('form.nameRequired') })}
              />
              <FieldError errors={errors.name ? [errors.name] : []} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{t('form.emailLabel')}</FieldLabel>
            <FieldContent>
              <Input
                aria-invalid={!!errors.email}
                id="email"
                placeholder={t('form.emailPlaceholder')}
                type="email"
                {...register('email', {
                  pattern: {
                    message: t('form.emailInvalid'),
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  },
                  required: t('form.emailRequired'),
                })}
              />
              <FieldError errors={errors.email ? [errors.email] : []} />
            </FieldContent>
          </Field>
        </div>
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="message">
            {t('form.descriptionLabel')}
          </FieldLabel>
          <FieldContent>
            <Textarea
              aria-invalid={!!errors.description}
              id="message"
              placeholder={t('form.descriptionPlaceholder')}
              rows={6}
              {...register('description', {
                maxLength: {
                  message: t('form.descriptionMaxLength'),
                  value: 1500,
                },
                required: t('form.descriptionRequired'),
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
          {submitting ? t('form.sending') : t('form.send')}
        </Button>
      </div>
    </form>
  );
};
