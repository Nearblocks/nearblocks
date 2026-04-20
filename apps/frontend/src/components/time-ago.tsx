'use client';

import { useMemo } from 'react';

import { ageFormat, toMs } from '@/lib/format';

type Props = {
  ns: null | string | undefined;
};

export const TimeAgo = ({ ns }: Props) => {
  const formatted = useMemo(() => (ns ? ageFormat(toMs(ns)) : null), [ns]);

  return formatted;
};
