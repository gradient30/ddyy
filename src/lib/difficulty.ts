// 难度自适应系统
// 根据孩子的成功率自动调整游戏难度

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  level: DifficultyLevel;
  timeMultiplier: number;   // 时间限制倍率 (越高越宽松)
  hintFrequency: number;    // 提示频率 (0-1, 越高提示越多)
  optionCount: number;      // 选项数量
  stepsCount: number;       // 步骤数量
}

const CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: { level: 'easy', timeMultiplier: 2.0, hintFrequency: 0.8, optionCount: 2, stepsCount: 4 },
  medium: { level: 'medium', timeMultiplier: 1.0, hintFrequency: 0.4, optionCount: 3, stepsCount: 6 },
  hard: { level: 'hard', timeMultiplier: 0.7, hintFrequency: 0.1, optionCount: 4, stepsCount: 8 },
};

/**
 * 根据成功率计算适合的难度
 * successRate: 0-100
 */
export function getDifficulty(successRate: number): DifficultyConfig {
  if (successRate < 40) return CONFIGS.easy;
  if (successRate < 75) return CONFIGS.medium;
  return CONFIGS.hard;
}

/**
 * 根据连续正确/错误次数动态调整
 */
export function getAdaptiveDifficulty(
  currentLevel: DifficultyLevel,
  consecutiveCorrect: number,
  consecutiveWrong: number
): DifficultyLevel {
  if (consecutiveWrong >= 3 && currentLevel !== 'easy') {
    return currentLevel === 'hard' ? 'medium' : 'easy';
  }
  if (consecutiveCorrect >= 5 && currentLevel !== 'hard') {
    return currentLevel === 'easy' ? 'medium' : 'hard';
  }
  return currentLevel;
}

/**
 * 获取鼓励性反馈文本
 */
export function getEncouragement(isCorrect: boolean, consecutiveCorrect: number): string {
  if (isCorrect) {
    if (consecutiveCorrect >= 5) return '太厉害了！你是小天才！🌟';
    if (consecutiveCorrect >= 3) return '连续答对！继续加油！🎉';
    return ['真棒！', '答对啦！', '好厉害！', '太聪明了！'][Math.floor(Math.random() * 4)];
  }
  return ['没关系，再试一次！', '加油，你可以的！', '别着急，慢慢来～', '差一点点，再想想？'][Math.floor(Math.random() * 4)];
}
