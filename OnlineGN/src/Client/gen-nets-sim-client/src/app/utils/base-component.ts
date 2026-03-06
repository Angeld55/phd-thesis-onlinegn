import { Injectable, OnDestroy } from '@angular/core';
import { Disposable } from './disposable';

@Injectable()
export class BaseComponent extends Disposable implements OnDestroy {
  public ngOnDestroy(): void {
    this.dispose();
  }
}
