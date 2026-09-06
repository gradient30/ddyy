import { describe, expect, it } from 'vitest';
import { AUDIO_MANIFEST } from '@/data/audio-manifest';

describe('AUDIO_MANIFEST', () => {
  it('maps teaching lines to mp3 files under audio/', () => {
    const keys = Object.keys(AUDIO_MANIFEST);
    expect(keys.length).toBeGreaterThan(20);
    expect(AUDIO_MANIFEST['zh-CN|欢迎回来，我们去成长小路吧']).toMatch(/^audio\/zh\/.+\.mp3$/);
    expect(AUDIO_MANIFEST['zh-CN|先装一个稳稳的底座']).toMatch(/^audio\/zh\/.+\.mp3$/);
  });
});
