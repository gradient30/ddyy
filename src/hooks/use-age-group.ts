import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

/**
 * 年龄段样式Hook
 * 根据当前用户的年龄段自动应用相应的CSS类
 * 
 * 使用方式：
 * - 在App组件中调用：useAgeGroupStyles()
 * - 会自动在document.documentElement上添加/移除toddler-mode类
 */
export function useAgeGroupStyles() {
  const { currentProfile, state } = useGame();
  
  useEffect(() => {
    const root = document.documentElement;
    
    // 应用年龄段样式
    if (currentProfile?.ageGroup === 'toddler') {
      root.classList.add('toddler-mode');
      root.classList.remove('child-mode');
    } else {
      root.classList.add('child-mode');
      root.classList.remove('toddler-mode');
    }
    
    // 应用护眼模式
    if (state.globalSettings.eyeCareMode) {
      root.classList.add('eye-care');
    } else {
      root.classList.remove('eye-care');
    }
    
    // 应用纸质模式
    if (state.globalSettings.paperMode) {
      root.classList.add('paper-mode');
    } else {
      root.classList.remove('paper-mode');
    }
    
    // 应用色盲友好模式
    if (state.globalSettings.colorBlindMode) {
      root.classList.add('colorblind-friendly');
    } else {
      root.classList.remove('colorblind-friendly');
    }
    
    // 高对比度模式
    if (state.globalSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 清理函数
    return () => {
      root.classList.remove('toddler-mode', 'child-mode', 'eye-care', 
        'paper-mode', 'colorblind-friendly', 'high-contrast');
    };
  }, [currentProfile?.ageGroup, state.globalSettings.eyeCareMode, 
      state.globalSettings.paperMode, state.globalSettings.colorBlindMode,
      state.globalSettings.highContrast]);
  
  return {
    isToddler: currentProfile?.ageGroup === 'toddler',
    isChild: currentProfile?.ageGroup === 'child',
    ageGroup: currentProfile?.ageGroup || 'child',
  };
}

/**
 * 获取年龄段特定的样式类名
 * 用于在组件中动态应用样式
 */
export function getAgeGroupClasses(isToddler: boolean): {
  button: string;
  text: string;
  container: string;
  touchTarget: string;
} {
  if (isToddler) {
    return {
      button: 'rounded-3xl text-xl font-bold py-4 px-8', // 大按钮
      text: 'text-lg leading-relaxed', // 大字体
      container: 'gap-6 p-6', // 宽松间距
      touchTarget: 'touch-target-xl', // 超大触摸区
    };
  }
  
  return {
    button: 'rounded-2xl text-base font-semibold py-3 px-6',
    text: 'text-base leading-normal',
    container: 'gap-4 p-4',
    touchTarget: 'touch-target',
  };
}

/**
 * 获取难度级别
 * 根据年龄段返回相应的难度
 */
export function getDifficultyForAgeGroup(ageGroup: 'toddler' | 'child'): {
  level: 1 | 2 | 3;
  hintFrequency: 'high' | 'medium' | 'low';
  timeLimit?: number;
} {
  switch (ageGroup) {
    case 'toddler':
      return {
        level: 1,
        hintFrequency: 'high',
        timeLimit: undefined, // 幼儿版无时间限制
      };
    case 'child':
    default:
      return {
        level: 2,
        hintFrequency: 'medium',
        timeLimit: 120, // 2分钟限制
      };
  }
}
