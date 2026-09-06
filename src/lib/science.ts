/** 红外被挡住时，杆必须抬着停住，不能落向车道上的车 */
export function barrierRaisedForSensor(blocking: boolean, idleRaised: boolean): boolean {
  return blocking ? true : idleRaised;
}
