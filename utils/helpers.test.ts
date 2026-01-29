import { describe, it, expect } from 'vitest';
import { formatTime, calculateProgress } from './helpers';

describe('formatTime', () => {
    it('formats seconds into MM:SS correctly', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(5)).toBe('0:05');
        expect(formatTime(59)).toBe('0:59');
        expect(formatTime(60)).toBe('1:00');
        expect(formatTime(65)).toBe('1:05');
        expect(formatTime(3600)).toBe('60:00');
    });

    it('handles negative seconds gracefully', () => {
        expect(formatTime(-10)).toBe('0:00');
    });
});

describe('calculateProgress', () => {
    it('calculates integer percentage correctly', () => {
        expect(calculateProgress(50, 100)).toBe(50);
        expect(calculateProgress(1, 3)).toBe(33);
    });

    it('handles zero total to avoid NaN', () => {
        expect(calculateProgress(10, 0)).toBe(0);
    });
});
