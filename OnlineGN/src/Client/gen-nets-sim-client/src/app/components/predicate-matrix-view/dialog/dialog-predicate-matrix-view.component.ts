import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Transition } from 'src/app/models/gen-net.model';

@Component({
  selector: 'dialog-predicate-matrix-view',
  templateUrl: './dialog-predicate-matrix-view.component.html',
  styleUrls: ['./dialog-predicate-matrix-view.component.scss'],
})
export class DialogPredicateMatrixViewComponent {
  protected transition: Transition | null = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { transition: Transition },
  ) {
    this.transition = data.transition;
  }
}
