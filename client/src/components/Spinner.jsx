import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function Spinner({ className, size = 24 }) {
  return <Loader2 className={cn('animate-spin text-brand-500', className)} size={size} />;
}
