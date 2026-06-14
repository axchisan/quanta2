import { describe, expect, it } from 'vitest';

import { cn } from '../src/lib/utils';

describe('cn', () => {
  it('merges conflicting Tailwind classes keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('resolves conflicts across multiple utilities', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('drops falsy conditional values', () => {
    expect(cn('text-sm', false, null, undefined, '')).toBe('text-sm');
  });

  it('applies a conditional class only when truthy', () => {
    const isActive = true;
    expect(cn('rounded', isActive && 'bg-primary')).toBe('rounded bg-primary');
  });

  it('deduplicates and merges from object/array inputs', () => {
    expect(cn(['p-2', { 'p-4': true }])).toBe('p-4');
  });
});
