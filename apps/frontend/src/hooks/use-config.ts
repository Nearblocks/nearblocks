'use client';

import { useContext } from 'react';

import { ConfigContext } from '@/providers/config';

export const useConfig = () => {
  const config = useContext(ConfigContext);

  if (!config) throw new Error('Configs are missing');

  return config;
};
