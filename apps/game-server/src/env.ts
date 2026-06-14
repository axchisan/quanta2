import { parseEnv, z } from '@quanta/config/env';

export const env = parseEnv(
  z.object({
    GAME_SERVER_PORT: z.coerce.number().int().positive().default(2567),
  }),
);
