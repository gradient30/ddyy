/**
 * 懒加载组件库
 * 提供图片、路由、背景等资源的懒加载支持
 */

export { LazyImage, LazyBackground } from './LazyImage';
export { lazyRoute, lazyComponent, prefetchRoute } from './LazyRoute';

// 类型导出
export type { LazyImageProps, LazyBackgroundProps } from './LazyImage';
