import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/app/lib/site';

describe('siteConfig', () => {
  it('exposes the Quanta brand name', () => {
    expect(siteConfig.name).toBe('Quanta');
  });
});
