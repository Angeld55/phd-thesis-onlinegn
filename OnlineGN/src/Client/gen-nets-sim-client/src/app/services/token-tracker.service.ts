import { Observable, Subject } from 'rxjs';
import { MovingToken } from '../models/graph-data.model';
import { Disposable } from '../utils/disposable';

export interface TokenTrackerMap {
  [placeId: string]: Set<MovingToken>;
}

export class TokenTracker extends Disposable {
  private _changes = new Subject<TokenTrackerMap>();
  private _tokens = new Set<MovingToken>();

  /**
   * @param trackerMap map with keys all places and values set of tokens in that place
   */
  constructor(private trackerMap: TokenTrackerMap) {
    super();
    Object.values(trackerMap).forEach((tokens) => {
      tokens.forEach((token) => {
        this._tokens.add(token);
      });
    });
  }

  public get tokens(): Set<MovingToken> {
    return this._tokens;
  }

  public getTokensAtPlace(placeId: string): Set<MovingToken> {
    return this.trackerMap[placeId] || new Set();
  }

  public setTokensAtPlace(placeId: string, newTokens: Set<MovingToken>) {
    const currentTokens = this.getTokensAtPlace(placeId);

    for (const token of currentTokens) {
      this.removeTokenFromPlace(placeId, token);
    }
    for (const token of newTokens) {
      this.addTokenToPlace(placeId, token);
    }
  }

  public placeChanges$(): Observable<TokenTrackerMap> {
    return this._changes;
  }

  public addTokenToPlace(placeId: string, token: MovingToken): void {
    if (!this.trackerMap[placeId]) {
      return;
    }

    if (!this._tokens.has(token)) {
      this._tokens.add(token);
    }
    this.trackerMap[placeId].add(token);
    this.nextChange(placeId);
  }

  public removeTokenFromPlace(placeId: string, token: MovingToken): void {
    if (!this.trackerMap[placeId]) {
      return;
    }

    this._tokens.delete(token);
    this.trackerMap[placeId].delete(token);
    this.nextChange(placeId);
  }

  private nextChange(placeId: string): void {
    const change: any = {};
    change[placeId] = this.trackerMap[placeId];
    this._changes.next(change);
  }

  override dispose(): void {
    super.dispose();
    this._changes.complete();
  }
}
