import {
  getGenNetGraphDataFromGenNetRaw,
  getTokensFromGenNetRaw,
} from './gen-net.service';
import { GenNetRaw } from '../models/gen-net.model';
import { GenNetGraphData, MovingToken } from '../models/graph-data.model';

describe('GenNetService', () => {
  let mockGenNet: GenNetRaw;

  beforeEach(() => {
    mockGenNet = {
      places: [
        {
          id: 'p1',
          name: 'p_1',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        {
          id: 'p2',
          name: 'p_2',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
      ],
      transitions: [
        {
          id: 'T1',
          name: 'T_1',
          splitFunction: null,
          priority: 2,
          data: [{ source: 'p1', target: 'p2', predicate: null, capacity: 1 }],
        },
      ],
      tokens: [
        {
          id: 'token1',
          name: 'token_1',
          host: 'p1',
          priority: 1,
          initialChars: { a: 1 },
        },
      ],
    };
  });

  describe('getGenNetGraphDataFromGenNetRaw', () => {
    it('should generate GenNetGraphData from GenNetRaw', () => {
      const result: GenNetGraphData =
        getGenNetGraphDataFromGenNetRaw(mockGenNet);

      expect(result.placeMap).toEqual({
        p1: {
          id: 'p1',
          name: 'p_1',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        p2: {
          id: 'p2',
          name: 'p_2',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
      });

      expect(result.transitions).toEqual({
        T1: {
          id: 'T1',
          name: 'T_1',
          splitFunction: null,
          priority: 2,
          data: [{ source: 'p1', target: 'p2', predicate: null, capacity: 1 }],
        },
      });

      expect(result.placeIdToTransitionId).toEqual({ p1: 'T1' });
      expect(result.placeIdToTransitionItems).toEqual({
        p1: [{ source: 'p1', target: 'p2', predicate: null, capacity: 1 }],
      });
      expect(result.placeIdToPreviousTransitionId).toEqual({ p2: 'T1' });
      expect(result.transitionToSourcePlaces).toEqual({
        T1: [
          {
            id: 'p1',
            name: 'p_1',
            charFunc: null,
            mergeFunction: null,
            priority: 1,
            capacity: 2,
          },
        ],
      });
      expect(result.transitionsSortedByPriority).toEqual([
        {
          id: 'T1',
          name: 'T_1',
          splitFunction: null,
          priority: 2,
          data: [{ source: 'p1', target: 'p2', predicate: null, capacity: 1 }],
        },
      ]);
    });
  });

  describe('getTokensFromGenNetRaw', () => {
    it('should generate MovingToken[] from GenNetRaw', () => {
      const result: MovingToken[] = getTokensFromGenNetRaw(mockGenNet);

      expect(result).toEqual([
        {
          id: 'token1',
          name: 'token_1',
          currentPositionsId: 'p1',
          priority: 1,
          chars: { a: 1 },
        },
      ]);
    });
  });
});
