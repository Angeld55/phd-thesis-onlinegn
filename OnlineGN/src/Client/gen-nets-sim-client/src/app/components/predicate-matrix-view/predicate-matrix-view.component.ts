import { Component, Input, OnChanges } from '@angular/core';
import { Transition } from 'src/app/models/gen-net.model';
import { BaseComponent } from 'src/app/utils/base-component';

@Component({
  selector: 'predicate-matrix-view',
  templateUrl: './predicate-matrix-view.component.html',
  styleUrls: ['./predicate-matrix-view.component.scss'],
})
export class PredicateMatrixViewComponent
  extends BaseComponent
  implements OnChanges
{
  @Input({ required: true }) public transition: Transition | null = null;

  protected toNames: string[] = [];
  protected fromNames: string[] = [];
  protected predicates: { [from: string]: { [to: string]: string | null } } =
    {};
  protected dataSource: { [key: string]: string | null }[] = [];

  ngOnChanges(): void {
    if (this.transition) {
      this.createTableData();
    }
  }

  public createTableData() {
    this.resetData();

    const uniqueFromNames = new Set<string>();
    const uniqueToNames = new Set<string>();
    this.transition!.data.forEach((item) => {
      if (!this.predicates[item.source]) {
        this.predicates[item.source] = {};
      }
      this.predicates[item.source][item.target] = item.predicate;
      uniqueFromNames.add(item.source);
      uniqueToNames.add(item.target);
    });
    this.fromNames = Array.from(uniqueFromNames);
    this.toNames = Array.from(uniqueToNames);

    this.fromNames.forEach((fromName) => {
      const row: { [key: string]: string | null } = {
        source: fromName,
      };
      this.toNames.forEach((toName: string) => {
        row[toName] = this.predicates[fromName][toName] || null;
      });
      this.dataSource.push(row);
    });
    this.toNames.unshift('source');
  }

  private resetData() {
    this.fromNames = [];
    this.toNames = [];
    this.predicates = {};
    this.dataSource = [];
  }
}
