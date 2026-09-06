export interface AudioFlags {
  sound: boolean;
  voice: boolean;
  vibrate: boolean;
}

let flags: AudioFlags = { sound: true, voice: true, vibrate: true };

export function setAudioFlags(next: Partial<AudioFlags>): void {
  flags = { ...flags, ...next };
}

export function getAudioFlags(): AudioFlags {
  return flags;
}
