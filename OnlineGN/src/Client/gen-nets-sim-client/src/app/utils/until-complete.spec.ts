import { of, Subject } from 'rxjs';
import { untilComplete } from './until-complete';

describe('untilComplete', () => {
  it('should complete after taking the first value from the observable', (done) => {
    const source$ = of(1, 2, 3);
    const result$ = untilComplete(source$);

    const values: number[] = [];
    result$.subscribe({
      next: (value) => values.push(value),
      complete: () => {
        expect(values).toEqual([1]);
        done();
      },
    });
  });

  it('should work with an observable that emits multiple values', (done) => {
    const source$ = new Subject<number>();
    const result$ = untilComplete(source$);

    const values: number[] = [];
    result$.subscribe({
      next: (value) => values.push(value),
      complete: () => {
        expect(values).toEqual([42]);
        done();
      },
    });

    source$.next(42);
    source$.next(100); // This should not be captured
    source$.complete();
  });

  it('should complete immediately if the observable is already completed', (done) => {
    const source$ = of();
    const result$ = untilComplete(source$);

    result$.subscribe({
      complete: () => {
        expect(true).toBe(true); // Just ensure it completes
        done();
      },
    });
  });
});
