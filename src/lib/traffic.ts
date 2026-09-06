import type { AgeBand } from '@/data/age';
import { getAgeConfig } from '@/data/age';

export type TrafficLight = 'red' | 'green';
export type LightAction = 'stop' | 'go';

/** 本课只教红灯停、绿灯行。黄灯不进关卡，避免卡关。 */
export function isCorrectLightAction(light: TrafficLight, action: LightAction): boolean {
  return (light === 'red' && action === 'stop') || (light === 'green' && action === 'go');
}

export function pickTrafficLight(seed = Math.random()): TrafficLight {
  return seed < 0.5 ? 'red' : 'green';
}

export function maxSafetyLevels(band: AgeBand | undefined | null): number {
  return getAgeConfig(band).maxTrafficLevels;
}

export function safetyStationCleared(doneCount: number, maxLevels: number): boolean {
  return maxLevels > 0 && doneCount >= maxLevels;
}

/** 车身和车位只要有横向重叠就算停进格子 */
export function carOverlapsSpot(
  car: { left: number; right: number },
  spot: { left: number; right: number },
): boolean {
  return car.left < spot.right && car.right > spot.left;
}
