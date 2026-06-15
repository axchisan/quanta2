import { parseEnv, z } from '@quanta/config/env';

export const env = parseEnv(
  z.object({
    GAME_SERVER_PORT: z.coerce.number().int().positive().default(2567),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().optional(),
    // Persistencia de resultados de sala (opcional: si faltan, se desactiva).
    SUPABASE_URL: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  }),
);
