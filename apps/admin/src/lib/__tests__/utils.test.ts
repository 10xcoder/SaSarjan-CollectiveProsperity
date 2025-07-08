import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('btn', 'btn-primary', 'text-white');
      expect(result).toBe('btn btn-primary text-white');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'btn',
        isActive && 'btn-active',
        isDisabled && 'btn-disabled'
      );
      
      expect(result).toBe('btn btn-active');
    });

    it('handles empty values', () => {
      const result = cn('btn', '', null, undefined, 'text-white');
      expect(result).toBe('btn text-white');
    });

    it('handles arrays of classes', () => {
      const result = cn(['btn', 'btn-primary'], 'text-white');
      expect(result).toBe('btn btn-primary text-white');
    });

    it('handles objects with conditional classes', () => {
      const result = cn({
        'btn': true,
        'btn-primary': true,
        'btn-disabled': false,
      });
      
      expect(result).toBe('btn btn-primary');
    });

    it('deduplicates classes', () => {
      const result = cn('btn btn-primary', 'btn', 'text-white');
      expect(result).toBe('btn-primary btn text-white');
    });

    it('handles Tailwind class conflicts', () => {
      // This tests tailwind-merge functionality
      const result = cn('px-2 py-1 px-3');
      expect(result).toBe('py-1 px-3');
    });

    it('returns empty string for no classes', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles complex combinations', () => {
      const variant = 'primary';
      const size = 'large';
      const disabled = false;
      
      const result = cn(
        'btn',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-large': size === 'large',
          'btn-small': size === 'small',
          'btn-disabled': disabled,
        },
        'transition-colors',
        disabled && 'opacity-50'
      );
      
      expect(result).toBe('btn btn-primary btn-large transition-colors');
    });
  });
});