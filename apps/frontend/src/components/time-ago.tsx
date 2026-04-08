'use client';

import { useRef } from 'react';

import { ageFormat, toMs } from '@/lib/format';

type Props = {
  ns: null | string | undefined;
};

export const TimeAgo = ({ ns }: Props) => {
  const cached = useRef<{ key: string; value: string } | null>(null);

  if (!ns) return null;

  if (!cached.current || cached.current.key !== ns) {
    cached.current = { key: ns, value: ageFormat(toMs(ns)) };
  }

  return cached.current.value;
};
