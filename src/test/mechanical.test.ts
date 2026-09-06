import { describe, expect, it } from 'vitest';
import { armKind, paintColors } from '@/components/parts/MechanicalBarrier';
import { getAudioFlags, setAudioFlags } from '@/lib/audio-flags';
import { playBarrierDrop, playBarrierLift, playPlacePart } from '@/lib/sound';

describe('mechanical barrier mapping', () => {
  it('reads real arm kinds from part ids', () => {
    expect(armKind('arm1')).toBe('straight');
    expect(armKind('arm2')).toBe('folding');
    expect(armKind('arm3')).toBe('fence');
    expect(armKind(undefined)).toBeNull();
  });

  it('keeps red-white as the default boom paint', () => {
    expect(paintColors(undefined).fill).toBe('#D63B32');
    expect(paintColors('paint2').stripe).toBe('#F4D35E');
  });
});

describe('mechanical sounds', () => {
  it('stay silent when the parent turns sound off', () => {
    setAudioFlags({ sound: false, voice: true, vibrate: false });
    expect(() => {
      playPlacePart();
      playBarrierLift();
      playBarrierDrop();
    }).not.toThrow();
    expect(getAudioFlags().sound).toBe(false);
    setAudioFlags({ sound: true, voice: true, vibrate: true });
  });
});
