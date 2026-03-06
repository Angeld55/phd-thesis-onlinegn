import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomFunction } from 'src/app/models/custom-function.model';
import { Place } from 'src/app/models/gen-net.model';
import { MovingToken } from 'src/app/models/graph-data.model';

export interface PlaceDialogData {
  functions: CustomFunction[];
  currentPlace: Place;
  tokens: Set<MovingToken>;
}

@Component({
  selector: 'place-dialog',
  templateUrl: './place-dialog.component.html',
  styleUrls: ['./place-dialog.component.scss'],
})
export class PlaceDialogComponent {
  protected selectedFunction: CustomFunction | undefined;

  protected currentPlace: Place;
  protected functions: CustomFunction[] = [];
  protected tokens: MovingToken[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlaceDialogData) {
    this.functions = data.functions;
    this.currentPlace = data.currentPlace;
    this.selectedFunction = this.functions.find(
      (f) => f.name === this.currentPlace.charFunc,
    );
    this.tokens = Array.from(data.tokens);
  }

  protected changeFunction(value: any) {
    this.selectedFunction = value;
    this.currentPlace.charFunc = value.name;
  }
}
