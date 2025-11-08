import React from 'react';

/**
 * Performance utilities for React components
 */

/**
 * Memoization helper for expensive calculations
 */
export const useMemoizedValue = <T,>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return React.useMemo(factory, deps);
};

/**
 * Memoized callback helper
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return React.useCallback(callback, deps) as T;
};

/**
 * Check if component should update (for use with React.memo)
 */
export const shallowCompare = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};
