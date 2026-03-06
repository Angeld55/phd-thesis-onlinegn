import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export function untilComplete<T>(observable: Observable<T>) {
  return observable.pipe(take(1));
}
