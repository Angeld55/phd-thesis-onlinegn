import { Injectable } from '@angular/core';
import { GraphEngineService, TokensInPlaces } from './graph-engine.service';
import { Observable, Subject } from 'rxjs';
import { TokenTracker, TokenTrackerMap } from './token-tracker.service';
import { MovingToken } from '../models/graph-data.model';
import { Disposable } from '../utils/disposable';

export interface TokenMove {
  sourceId: string;
  targetId: string;
  token: MovingToken;
}

type Move = { [targetId: string]: { tokens: Set<MovingToken> } };

/**
 * Moves is a map from sourceId to targetId and which tokens are moved
 */
export type Moves = {
  [sourceId: string]: Move;
};

/**
 * Idea:
 * 1. Register all the moves you want to make
 * 2. Then call move() to make all the moves you have registered.
 *
 * Win:
 * 1. We can track all moves from one place to another
 * 2. How many tokens are moving in direction
 * 3. Track when all the movements are done
 */
@Injectable({
  providedIn: 'root',
})
export class TokenMoverService extends Disposable {
  private tokenTracker!: TokenTracker;
  private graphEngine!: GraphEngineService;
  private moves: Moves = {};
  private static getNodesCountUpdateObjectFromTokenTrackerMap(
    tokenTrackerMap: TokenTrackerMap,
  ): TokensInPlaces {
    const updateObject: TokensInPlaces = {};

    for (const [placeId, tokens] of Object.entries(tokenTrackerMap)) {
      updateObject[placeId] = tokens.size;
    }

    return updateObject;
  }

  private updateNodesCount(tokenTrackerMap: TokenTrackerMap) {
    const updateObject =
      TokenMoverService.getNodesCountUpdateObjectFromTokenTrackerMap(
        tokenTrackerMap,
      );
    this.graphEngine.updateNodesCount(updateObject);
  }

  public getTokensAtPlace(placeId: string): Set<MovingToken> {
    return this.tokenTracker.getTokensAtPlace(placeId);
  }

  public setTokensAtPlace(placeId: string, newTokens: Set<MovingToken>) {
    this.tokenTracker.setTokensAtPlace(placeId, newTokens);
  }

  public addTokenToPlace(placeId: string, token: MovingToken): void {
    this.tokenTracker.addTokenToPlace(placeId, token);
  }

  public get tokens(): Set<MovingToken> {
    return this.tokenTracker.tokens;
  }

  public reset(
    graphEngine: GraphEngineService,
    tokenTrackerMap: TokenTrackerMap,
  ) {
    this.graphEngine = graphEngine;
    this.tokenTracker?.dispose();
    this.updateNodesCount(tokenTrackerMap);
    this.tokenTracker = new TokenTracker(tokenTrackerMap);
    this.untilDispose(this.tokenTracker.placeChanges$()).subscribe(
      (changes: TokenTrackerMap) => this.updateNodesCount(changes),
    );
    this.moves = {};
  }

  public placeChanges$(): Observable<TokenTrackerMap> {
    return this.tokenTracker.placeChanges$();
  }

  /**
   * Starts the moves that are registered
   * @returns Subject that completes when all the moves are done
   */
  public move(): Subject<Moves> {
    const finished$ = new Subject<Moves>();
    const sourceIds = Object.keys(this.moves);
    let leftMoves = sourceIds.length;

    for (const sourceId in this.moves) {
      for (const targetId in this.moves[sourceId]) {
        const move = this.moves[sourceId][targetId];
        move.tokens.forEach((token) => {
          this.tokenTracker.removeTokenFromPlace(sourceId, token);
        });

        this.graphEngine.animate(
          sourceId,
          targetId,
          move.tokens.size.toString(),
          () => {
            move.tokens.forEach((token) => {
              token.currentPositionsId = targetId;
              this.tokenTracker.addTokenToPlace(targetId, token);
            });

            if (--leftMoves === 0) {
              const temp = this.moves;
              this.moves = {};
              finished$.next(temp);
              finished$.complete();
            }
          },
        );
      }
    }

    return finished$;
  }

  public hasMoves(): boolean {
    return Object.keys(this.moves).length > 0;
  }

  public addTokenMove(tokenMove: TokenMove) {
    if (!this.moves[tokenMove.sourceId]) {
      this.moves[tokenMove.sourceId] = {}; // add source
    }
    if (!this.moves[tokenMove.sourceId][tokenMove.targetId]) {
      this.moves[tokenMove.sourceId][tokenMove.targetId] = {
        // add target
        tokens: new Set<MovingToken>(),
      };
    }

    // add token to move from source to target
    this.moves[tokenMove.sourceId][tokenMove.targetId].tokens.add(
      tokenMove.token,
    );
  }

  override dispose(): void {
    super.dispose();
    this.tokenTracker?.dispose();
  }
}
