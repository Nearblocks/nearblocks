import * as z from 'zod/v4/mini';

const validateJSON = (input: z.core.ParsePayload<string>) => {
  const val = input.value;
  if (!val.trim()) return;
  try {
    JSON.parse(val);
  } catch {
    input.issues.push({
      code: 'custom',
      input: val,
      message: 'Invalid JSON format',
      path: [],
    });
  }
};

const validateNonEmpty = (input: z.core.ParsePayload<string>) => {
  if (input.value.length < 1) {
    input.issues.push({
      code: 'custom',
      input: input.value,
      message: 'Method is required',
      path: [],
    });
  }
};

export const formSchema = z
  .object({
    args: z.string().check(validateJSON),
    blockId: z.optional(z.string()),
    blockRef: z.enum(['finality', 'blockId']),
    deposit: z.optional(z.string()),
    finality: z.enum(['final', 'near-final', 'optimistic']),
    gas: z.optional(z.string()),
    method: z.string().check(validateNonEmpty),
    mode: z.enum(['view', 'change']),
  })
  .check((input) => {
    const data = input.value;

    if (data.mode === 'change') {
      if (!data.gas?.trim()) {
        input.issues.push({
          code: 'custom',
          input: data,
          message: 'Gas is required',
          path: ['gas'],
        });
      } else if (!/^\d+(\.\d+)?$/.test(data.gas)) {
        input.issues.push({
          code: 'custom',
          input: data,
          message: 'Must be a valid number',
          path: ['gas'],
        });
      }

      if (!data.deposit?.trim()) {
        input.issues.push({
          code: 'custom',
          input: data,
          message: 'Deposit is required',
          path: ['deposit'],
        });
      } else if (!/^\d+(\.\d+)?$/.test(data.deposit)) {
        input.issues.push({
          code: 'custom',
          input: data,
          message: 'Must be a valid number',
          path: ['deposit'],
        });
      }
    }

    if (data.mode === 'view' && data.blockRef === 'blockId') {
      if (!data.blockId?.trim()) {
        input.issues.push({
          code: 'custom',
          input: data,
          message: 'Block ID is required',
          path: ['blockId'],
        });
      }
    }
  });

export type FormData = z.infer<typeof formSchema>;
