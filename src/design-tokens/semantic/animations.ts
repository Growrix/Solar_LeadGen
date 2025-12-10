/**
 * Animation & Transition Tokens
 * 
 * Consistent animation timings and easing functions.
 * Use these for smooth, performant animations across the application.
 * 
 * Usage: Import in Tailwind config and components.
 * Use semantic durations (duration.fast, duration.normal) for consistency.
 * 
 * @see https://tailwindcss.com/docs/animation
 * @see https://tailwindcss.com/docs/transition-timing-function
 */

import type { AnimationDuration } from '../types';

export const animations = {
  // Transition durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  } as AnimationDuration,
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Predefined transitions (for convenience)
  transition: {
    colors: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Keyframe animations (for Tailwind animate- classes)
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideInUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideOutDown: {
      from: { transform: 'translateY(0)', opacity: '1' },
      to: { transform: 'translateY(10px)', opacity: '0' },
    },
    slideInLeft: {
      from: { transform: 'translateX(-10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    slideInRight: {
      from: { transform: 'translateX(10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: '1' },
      to: { transform: 'scale(0.95)', opacity: '0' },
    },
  },
} as const;

export type AnimationTokens = typeof animations;
