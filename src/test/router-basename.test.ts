import { describe, expect, it } from 'vitest';
import { basenameFromViteBase } from '@/lib/utils';

describe('basenameFromViteBase', () => {
  it('omits basename on the site root', () => {
    expect(basenameFromViteBase('/')).toBeUndefined();
  });

  it('strips the trailing slash for GitHub project Pages', () => {
    expect(basenameFromViteBase('/ddyy/')).toBe('/ddyy');
  });
});
