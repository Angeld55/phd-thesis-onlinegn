import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CustomFunction } from 'src/app/models/custom-function.model';
import { Transition } from 'src/app/models/gen-net.model';
import { DialogPredicateMatrixViewComponent } from '../../predicate-matrix-view/dialog/dialog-predicate-matrix-view.component';

export interface TransitionDialogData {
  functions: CustomFunction[];
  currentTransition: Transition;
}

@Component({
  selector: 'transition-dialog',
  templateUrl: './transition-dialog.component.html',
  styleUrls: ['./transition-dialog.component.scss'],
})
export class TransitionDialogComponent {
  protected transition: Transition;
  protected functions: CustomFunction[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TransitionDialogData,
    private dialog: MatDialog,
  ) {
    this.functions = data.functions;
    this.transition = data.currentTransition;
  }

  public showPredicateMatrix(): void {
    this.dialog.open(DialogPredicateMatrixViewComponent, {
      data: {
        transition: this.transition,
      },
    });
  }
}
