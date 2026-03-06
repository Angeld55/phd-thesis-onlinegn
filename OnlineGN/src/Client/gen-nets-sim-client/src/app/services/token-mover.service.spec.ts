import { TestBed } from '@angular/core/testing';
import { TokenMoverService, TokenMove, Moves } from './token-mover.service';
import { GraphEngineService } from './graph-engine.service';
import { TokenTracker, TokenTrackerMap } from './token-tracker.service';
import { MovingToken } from '../models/graph-data.model';
import { Subject } from 'rxjs';

describe('TokenMoverService', () => {
  let service: TokenMoverService;
  let mockGraphEngine: jasmine.SpyObj<GraphEngineService>;
  let mockTokenTracker: jasmine.SpyObj<TokenTracker>;

  beforeEach(() => {
    mockGraphEngine = jasmine.createSpyObj('GraphEngineService', [
      'updateNodesCount',
      'animate',
    ]);
    mockTokenTracker = jasmine.createSpyObj('TokenTracker', [
      'getTokensAtPlace',
      'setTokensAtPlace',
      'addTokenToPlace',
      'removeTokenFromPlace',
      'placeChanges$',
    ]);
    mockTokenTracker.getTokensAtPlace.and.returnValue(new Set<MovingToken>());
    mockTokenTracker.setTokensAtPlace.and.callThrough();
    mockTokenTracker.addTokenToPlace.and.callThrough();
    mockTokenTracker.removeTokenFromPlace.and.callThrough();

    mockTokenTracker.placeChanges$.and.returnValue(
      new Subject<TokenTrackerMap>(),
    );

    TestBed.configureTestingModule({
      providers: [
        TokenMoverService,
        { provide: GraphEngineService, useValue: mockGraphEngine },
        { provide: TokenTracker, useValue: mockTokenTracker },
      ],
    });

    service = TestBed.inject(TokenMoverService);
  });

  describe('reset', () => {
    it('should reset the token tracker and update node counts', () => {
      const tokenTrackerMap: TokenTrackerMap = {
        place1: new Set(),
        place2: new Set(),
      };

      service.reset(mockGraphEngine, tokenTrackerMap);

      expect(mockGraphEngine.updateNodesCount).toHaveBeenCalled();
    });
  });

  describe('addTokenMove', () => {
    it('should register a token move', () => {
      const tokenMove: TokenMove = {
        sourceId: 'place1',
        targetId: 'place2',
        token: { id: 'token1', currentPositionsId: 'place1' } as any,
      };

      service.addTokenMove(tokenMove);

      expect(
        service['moves'][tokenMove.sourceId][tokenMove.targetId].tokens.has(
          tokenMove.token,
        ),
      ).toBeTrue();
    });
  });

  describe('hasMoves', () => {
    it('should return true if there are moves registered', () => {
      const tokenMove: TokenMove = {
        sourceId: 'place1',
        targetId: 'place2',
        token: { id: 'token1', currentPositionsId: 'place1' } as any,
      };

      service.addTokenMove(tokenMove);

      expect(service.hasMoves()).toBeTrue();
    });

    it('should return false if there are no moves registered', () => {
      expect(service.hasMoves()).toBeFalse();
    });
  });
});
