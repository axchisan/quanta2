import type { ProviderId } from '@quanta/types';
import { AllProvidersFailedError } from './providers/types';
import type { TextProvider } from './providers/types';

/** Try text providers in order; return first success, else throw AllProvidersFailedError. */
export async function runTextChain(
  providers: TextProvider[],
  prompt: string,
): Promise<{ text: string; provider: ProviderId }> {
  const failures: Array<{ provider: ProviderId; error: unknown }> = [];

  for (const provider of providers) {
    try {
      const text = await provider.generateText(prompt);
      return { text, provider: provider.id };
    } catch (error) {
      console.warn(`[ai-gateway] text provider "${provider.id}" failed; trying next`, error);
      failures.push({ provider: provider.id, error });
    }
  }

  throw new AllProvidersFailedError(failures);
}
