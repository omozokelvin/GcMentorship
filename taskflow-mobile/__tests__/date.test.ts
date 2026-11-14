import { isToday, isOverdue, formatDueDate } from '../src/shared/utils/date';

describe('date utilities', () => {
  test('isToday detects current calendar day', () => {
    expect(isToday(new Date())).toBe(true);
    const yesterday = new Date(Date.now() - 86400 * 1000);
    expect(isToday(yesterday)).toBe(false);
    expect(isToday(null)).toBe(false);
  });

  test('isOverdue returns false for completed tasks', () => {
    const past = new Date(Date.now() - 3600 * 1000);
    expect(isOverdue(past, false)).toBe(true);
    expect(isOverdue(past, true)).toBe(false);
  });

  test('formatDueDate prefixes Today for same-day timestamps', () => {
    const label = formatDueDate(new Date());
    expect(label.startsWith('Today,')).toBe(true);
  });
});
