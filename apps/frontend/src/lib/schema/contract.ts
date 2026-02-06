import { z } from 'zod';

export const formSchema = z
  .object({
    args: z.string().refine(
      (val) => {
        if (!val.trim()) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid JSON format' },
    ),
    blockId: z.string().optional(),
    blockRef: z.enum(['finality', 'blockId']),
    deposit: z.string().optional(),
    finality: z.enum(['final', 'near-final', 'optimistic']),
    gas: z.string().optional(),
    method: z.string().min(1, 'Method is required'),
    mode: z.enum(['view', 'change']),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'change') {
      if (!data.gas?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Gas is required',
          path: ['gas'],
        });
      } else if (!/^\d+(\.\d+)?$/.test(data.gas)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Must be a valid number',
          path: ['gas'],
        });
      }

      if (!data.deposit?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Deposit is required',
          path: ['deposit'],
        });
      } else if (!/^\d+(\.\d+)?$/.test(data.deposit)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Must be a valid number',
          path: ['deposit'],
        });
      }
    }

    if (data.mode === 'view' && data.blockRef === 'blockId') {
      if (!data.blockId?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Block ID is required',
          path: ['blockId'],
        });
      }
    }
  });

export type FormData = z.infer<typeof formSchema>;
