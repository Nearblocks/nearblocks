import { z } from 'zod';

const fileSchema = z.object({
  data: z.instanceof(Buffer),
  encoding: z.string(),
  mimetype: z.string().refine((mimetype) => mimetype === 'application/zip', {
    message: 'File must be a ZIP',
  }),
  name: z.string(),
  size: z.number().max(1024 * 1024, 'File size must be less than 1MB'),
});

const verify = z.object({
  accountId: z.string(),
  contractZip: fileSchema,
});

const status = z.object({
  verificationId: z.string(),
});

export type Verify = z.infer<typeof verify>;
export type Status = z.infer<typeof status>;

export default { status, verify };
