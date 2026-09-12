import clsx from 'clsx';

// Thin wrapper so components can do cn('base', condition && 'extra') without
// importing clsx directly everywhere.
export function cn(...args) {
  return clsx(...args);
}
