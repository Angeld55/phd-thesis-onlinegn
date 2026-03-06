import { Injectable } from '@angular/core';
import { BaseComponent } from './base-component';
import { BehaviorSubject, finalize, Observable } from 'rxjs';

@Injectable()
export class BaseLoadableComponent extends BaseComponent {
  protected isLoading$ = new BehaviorSubject<boolean>(false);

  protected loadingUntilComplete<T>(obs: Observable<T>): Observable<T> {
    this.isLoading$.next(true);
    return obs.pipe(
      finalize(() => {
        this.isLoading$.next(false);
      }),
    );
  }
}
