import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  // Spring transitions
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  } as Transition,

  springSmooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } as Transition,

  // Tween transitions
  fast: {
    type: 'tween',
    duration: 0.2,
    ease: 'easeOut',
  } as Transition,

  normal: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
  } as Transition,

  slow: {
    type: 'tween',
    duration: 0.5,
    ease: 'easeInOut',
  } as Transition,
};

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, y: -20, transition: transitions.fast },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, y: 20, transition: transitions.fast },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: transitions.spring },
  exit: { opacity: 0, x: 20, transition: transitions.fast },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.spring },
  exit: { opacity: 0, x: -20, transition: transitions.fast },
};

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: transitions.springBouncy },
  exit: { opacity: 0, scale: 0.8, transition: transitions.fast },
};

export const scaleInCenter: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: transitions.springBouncy },
  exit: { opacity: 0, scale: 0, transition: transitions.fast },
};

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

export const slideInUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: transitions.spring },
  exit: { y: '100%', transition: transitions.normal },
};

export const slideInDown: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0, transition: transitions.spring },
  exit: { y: '-100%', transition: transitions.normal },
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: transitions.spring },
  exit: { x: '-100%', transition: transitions.normal },
};

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: transitions.spring },
  exit: { x: '100%', transition: transitions.normal },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// MODAL/OVERLAY ANIMATIONS
// ============================================================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

// ============================================================================
// BUTTON/INTERACTIVE ANIMATIONS
// ============================================================================

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: transitions.fast,
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardHover = {
  y: -4,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  transition: transitions.spring,
};

// ============================================================================
// NOTIFICATION/TOAST ANIMATIONS
// ============================================================================

export const notificationSlideIn: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.fast,
  },
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getStaggerDelay = (index: number, baseDelay = 0.05) => {
  return index * baseDelay;
};

export const createStaggerContainer = (staggerDelay = 0.1, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});


