import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'headline-xs',
        'headline-sm',
        'headline-base',
        'headline-lg',
        'headline-xl',
        'headline-2xl',
        'headline-3xl',
        'headline-4xl',
        'headline-5xl',
        'body-xs',
        'body-sm',
        'body-base',
        'body-lg',
        'body-xl',
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => {
  return merge(clsx(inputs));
};
