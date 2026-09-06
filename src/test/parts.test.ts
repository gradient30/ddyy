import { describe, expect, it } from 'vitest';
import { PART_ICON_IDS } from '@/components/parts/PartIcons';

describe('PartIcons', () => {
  it('covers the factory and treasure part ids kids tap', () => {
    const needed = [
      'base', 'base1', 'base2', 'pillar', 'motor', 'motor2', 'arm1', 'arm2', 'arm3',
      'sensor', 'light', 'panel', 'paint1', 'bolt', 'gear', 'spring', 'wire', 'board',
      'led', 'battery', 'solar', 'hinge', 'bucket', 'cam', 'chip', 'sign', 'cable',
    ];
    for (const id of needed) {
      expect(PART_ICON_IDS).toContain(id);
    }
  });
});
