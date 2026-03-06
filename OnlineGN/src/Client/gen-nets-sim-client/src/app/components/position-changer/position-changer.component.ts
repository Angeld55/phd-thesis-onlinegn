import { Component, Input } from '@angular/core';
import { Point } from 'src/app/d3/drag-behaviour';
import { GraphEngineService } from 'src/app/services/graph-engine.service';
import { BaseComponent } from 'src/app/utils/base-component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

enum ElementType {
  Place = 0,
  Transition = 1,
  Edge = 2,
}

@Component({
  selector: 'position-changer',
  templateUrl: './position-changer.component.html',
  styleUrls: ['./position-changer.component.scss'],
})
export class PositionChangerComponent extends BaseComponent {
  @Input({ required: true }) public graphEngine: GraphEngineService | null =
    null;

  protected points: Point[] = [];
  protected selectedClassList: DOMTokenList | null = null;
  protected elementType: ElementType = ElementType.Place;

  ngOnInit() {
    this.untilDispose(this.graphEngine!.elementClicked).subscribe((element) => {
      this.points = [];
      this.selectedClassList = element.classList;
      this.populatePoints(element.classList);
    });
  }

  private populatePoints(classList: DOMTokenList): void {
    if (classList.contains('place')) {
      const centre = this.graphEngine!.getPlaceCentre(classList.value);
      this.elementType = ElementType.Place;
      this.points.push(centre);
    } else if (classList.contains('edge')) {
      const edgePoints = this.graphEngine!.getEdgePoints(classList.value);
      this.elementType = ElementType.Edge;
      this.points.push(...edgePoints);
    } else {
      const topLeftPoint = this.graphEngine!.getTransitionTopLeft(
        classList.value,
      );
      this.elementType = ElementType.Transition;
      this.points.push(topLeftPoint);
      this.transitionLength = this.graphEngine!.getTransitionLength(
        classList.value,
      );
    }
  }

  protected pointChanged(x: number, y: number, index: number): void {
    this.points[index] = { x, y };
    if (this.elementType === ElementType.Place) {
      this.graphEngine!.setPlaceCentre(
        this.selectedClassList!.value,
        this.points[index],
      );
    } else if (this.elementType === ElementType.Transition) {
      this.graphEngine!.setTransitionTopLeft(
        this.selectedClassList!.value,
        this.points[index],
      );
    } else {
      this.graphEngine!.setEdgePoints(
        this.selectedClassList!.value,
        this.points,
      );
    }
  }

  protected transitionLength = 0;
  protected transitionLengthChanged(length: number | null): void {
    if (length === null || length < 1) {
      length = 1;
    }
    this.transitionLength = length;
    this.graphEngine!.setTransitionLength(
      this.selectedClassList!.value,
      length,
    );
  }

  protected trackByFn(index: number, item: Point): number {
    return index;
  }

  protected drop(event: CdkDragDrop<Point[]>) {
    moveItemInArray(this.points, event.previousIndex, event.currentIndex);

    if (this.elementType === ElementType.Edge) {
      this.graphEngine!.setEdgePoints(
        this.selectedClassList!.value,
        this.points,
      );
    }
  }

  protected addPoint(): void {
    if (this.elementType !== ElementType.Edge) {
      return;
    }
    const lastPoint = this.points[this.points.length - 1];
    this.points.push({ x: lastPoint.x + 10, y: lastPoint.y + 10 });
    this.graphEngine!.setEdgePoints(this.selectedClassList!.value, this.points);
  }

  protected deletePoint(index: number): void {
    if (this.elementType !== ElementType.Edge) {
      return;
    }
    this.points.splice(index, 1);
    this.graphEngine!.setEdgePoints(this.selectedClassList!.value, this.points);
  }
}
