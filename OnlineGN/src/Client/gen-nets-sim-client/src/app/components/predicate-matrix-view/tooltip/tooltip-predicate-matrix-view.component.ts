import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Transition } from 'src/app/models/gen-net.model';
import { GenNetGraphData } from 'src/app/models/graph-data.model';
import { GraphEngineService } from 'src/app/services/graph-engine.service';
import { BaseComponent } from 'src/app/utils/base-component';

@Component({
  selector: 'tooltip-predicate-matrix-view',
  templateUrl: './tooltip-predicate-matrix-view.component.html',
  styleUrls: ['./tooltip-predicate-matrix-view.component.scss'],
})
export class TooltipPredicateMatrixViewComponent
  extends BaseComponent
  implements OnInit
{
  @Input({ required: true }) graphEngine!: GraphEngineService;
  @Input({ required: true }) genNetGraphData!: GenNetGraphData;
  protected transition: Transition | null = null;

  @HostBinding('style.top') protected top: string = '0px';
  @HostBinding('style.left') protected left: string = '0px';

  ngOnInit(): void {
    this.untilDispose(this.graphEngine!.elementEntered).subscribe((data) => {
      if (data.node.type == 'transition' && !this.transition) {
        this.transition = this.genNetGraphData!.transitions[data.node.name];

        this.top = data.event.clientY + 10 + 'px';
        this.left = data.event.clientX + 10 + 'px';
      }
    });

    this.untilDispose(this.graphEngine!.elementExited).subscribe((_) => {
      this.transition = null;
    });
  }
}
