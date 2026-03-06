import { ExecutedMovesTracker } from './executed-moves-tracker.service';

describe('ExecutedMovesTracker', () => {
  let tracker: ExecutedMovesTracker;

  beforeEach(() => {
    tracker = new ExecutedMovesTracker();
  });

  it('should initialize with an empty counter', () => {
    expect(tracker.getCount('source1', 'target1')).toBe(0);
    expect(tracker.getCountForSource('source1')).toBe(0);
    expect(tracker.getCountToTarget('target1')).toBe(0);
  });

  it('should increment the counter for a specific source and target', () => {
    tracker.addMove('source1', 'target1');
    expect(tracker.getCount('source1', 'target1')).toBe(1);

    tracker.addMove('source1', 'target1');
    expect(tracker.getCount('source1', 'target1')).toBe(2);
  });

  it('should return the total count for a specific source', () => {
    tracker.addMove('source1', 'target1');
    tracker.addMove('source1', 'target2');
    tracker.addMove('source1', 'target2');

    expect(tracker.getCountForSource('source1')).toBe(3);
  });

  it('should return the total count for a specific target', () => {
    tracker.addMove('source1', 'target1');
    tracker.addMove('source2', 'target1');
    tracker.addMove('source2', 'target1');

    expect(tracker.getCountToTarget('target1')).toBe(3);
  });

  it('should reset the counter', () => {
    tracker.addMove('source1', 'target1');
    tracker.addMove('source2', 'target2');

    tracker.resetCounter();

    expect(tracker.getCount('source1', 'target1')).toBe(0);
    expect(tracker.getCount('source2', 'target2')).toBe(0);
    expect(tracker.getCountForSource('source1')).toBe(0);
    expect(tracker.getCountToTarget('target2')).toBe(0);
  });
});
