'use client';

import { ageFormat, toMs } from '@/lib/format';

type Props = {
  ns: null | string | undefined;
};

export const TimeAgo = ({ ns }: Props) => {
  if (!ns) return null;

  return ageFormat(toMs(ns));
};
