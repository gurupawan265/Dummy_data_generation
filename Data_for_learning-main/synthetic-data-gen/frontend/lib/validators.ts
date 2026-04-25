import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'uuid', 'integer', 'float', 'string', 'name', 'first_name', 'last_name',
  'email', 'phone', 'date', 'datetime', 'boolean', 'enum', 'city',
  'country', 'address', 'url', 'ip_address', 'custom_regex'
]);

export const DistributionTypeSchema = z.enum(['normal', 'uniform', 'exponential', 'lognormal']);

export const DistributionConfigSchema = z.object({
  type: DistributionTypeSchema,
  mean: z.number().optional(),
  std: z.number().optional(),
  low: z.number().optional(),
  high: z.number().optional(),
  scale: z.number().optional(),
});

export const FieldConstraintsSchema = z.object({
  min: z.any().optional(),
  max: z.any().optional(),
  unique: z.boolean().default(false),
  nullable: z.boolean().default(true),
  regex: z.string().optional(),
});

export const FieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string(),
  constraints: FieldConstraintsSchema.optional(),
  distribution: DistributionConfigSchema.optional(),
  missing: z.object({
    rate: z.number().min(0).max(1).default(0),
    pattern: z.enum(['random', 'block', 'trailing']).default('random'),
  }).optional(),
  values: z.array(z.any()).optional(),
  weights: z.array(z.number()).optional(),
});

export const DataSchema = z.object({
  schema_id: z.string(),
  version: z.string().default('1.0'),
  row_count: z.number().min(1).max(100000).default(1000),
  seed: z.number().optional(),
  fields: z.array(FieldSchema),
});
