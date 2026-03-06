import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovingToken } from 'src/app/models/graph-data.model';

@Component({
  selector: 'tokens-list',
  templateUrl: './tokens-list-dialog.component.html',
  styleUrls: ['./tokens-list-dialog.component.scss'],
})
export class TokensListDialogComponent {
  protected tokens: MovingToken[] = [];
  protected filteredTokens: MovingToken[] = [];
  protected filter: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tokens: MovingToken[] }) {
    this.tokens = Array.from(data.tokens);
    this.filteredTokens = this.tokens;
  }

  public searchFilterChange(_: string) {
    this.filteredTokens = this.tokens.filter((token) => {
      return token.name.toLowerCase().includes(this.filter.toLowerCase());
    });
  }
}
