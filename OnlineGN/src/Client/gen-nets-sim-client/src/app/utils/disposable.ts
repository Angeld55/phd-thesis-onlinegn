import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { untilComplete } from './until-complete';

export class Disposable {
  private destroying$: Subject<void> = new Subject<void>();

  protected untilDispose<T>(observable: Observable<T>): Observable<T> {
    return observable.pipe(takeUntil(this.destroy$));
  }

  protected untilComplete<T>(observable: Observable<T>): Observable<T> {
    return this.untilDispose(untilComplete(observable));
  }

  protected get destroy$(): Observable<void> {
    return this.destroying$;
  }

  public dispose(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
