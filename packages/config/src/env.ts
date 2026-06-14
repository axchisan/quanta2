import { z } from 'zod';

/**
 * Valida el entorno contra un schema Zod y falla rápido con un mensaje claro.
 * Cada app/paquete define su propio schema y llama a esta función al arrancar.
 */
export function parseEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  source: Record<string, string | undefined> = process.env,
): z.infer<TSchema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return result.data;
}

export { z };
