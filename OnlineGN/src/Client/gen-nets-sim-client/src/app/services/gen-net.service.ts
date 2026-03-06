import { Injectable } from '@angular/core';
import { GenNetRaw } from '../models/gen-net.model';
import { GenNetGraphData, MovingToken } from '../models/graph-data.model';
import { deepCopy } from '../utils/deep-copy';

export function getGenNetGraphDataFromGenNetRaw(
  genNet: GenNetRaw,
): GenNetGraphData {
  const result: GenNetGraphData = {
    placeMap: {},
    placeIdToTransitionId: {},
    placeIdToTransitionItems: {},
    placeIdToPreviousTransitionId: {},
    tokens: [],
    transitions: {},
    transitionToSourcePlaces: {},
    transitionsSortedByPriority: [],
  };

  genNet.places.forEach((place) => {
    // set default values
    place.priority = place.priority || 1;
    place.capacity = place.capacity || 1;

    result.placeMap[place.id] = place;
  });

  genNet.transitions.forEach((transition) => {
    // set default value
    transition.priority = transition.priority || 1;
    result.transitions[transition.id] = transition;
    transition.data.forEach((item) => {
      // set default value
      item.capacity = item.capacity || 1;

      if (!result.placeIdToTransitionId[item.source]) {
        result.placeIdToTransitionId[item.source] = transition.id;
      }

      if (!result.placeIdToTransitionItems[item.source]) {
        result.placeIdToTransitionItems[item.source] = [];
      }

      result.placeIdToTransitionItems[item.source].push(item);
    });

    transition.data.forEach((item) => {
      result.placeIdToPreviousTransitionId[item.target] = transition.id;
    });
  });

  genNet.transitions.forEach((transition) => {
    const uniqueSourcePlaces = [
      ...new Set(transition.data.map((item) => result.placeMap[item.source])),
    ];
    result.transitionToSourcePlaces[transition.id] = uniqueSourcePlaces;
  });

  result.transitionsSortedByPriority = genNet.transitions.sort(
    (a, b) => b.priority - a.priority,
  );

  result.tokens = getTokensFromGenNetRaw(genNet);

  return result;
}

export function getTokensFromGenNetRaw(genNet: GenNetRaw): MovingToken[] {
  const result: MovingToken[] = [];
  genNet.tokens.forEach((token) => {
    // set default values
    token.priority = token.priority || 1;
    result.push({
      id: token.id,
      name: token.name,
      currentPositionsId: token.host,
      priority: token.priority,
      chars: deepCopy(token.initialChars),
    });
  });
  return result;
}

@Injectable()
export class GenNetService {
  getGenNetMock(): GenNetRaw {
    return {
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
        {
          id: 'p3',
          name: 'p_3',
          charFunc: 'functionWithToken',
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        {
          id: 'p4',
          name: 'p_4',
          charFunc: null,
          mergeFunction: 'mergeTokensOnP4',
          priority: 2,
          capacity: 1,
        },
        {
          id: 'p5',
          name: 'p_5',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        {
          id: 'p6',
          name: 'p_6',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        {
          id: 'p7',
          name: 'p_7',
          charFunc: null,
          mergeFunction: null,
          priority: 1,
          capacity: 2,
        },
        {
          id: 'p8',
          name: 'p_8',
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
          splitFunction: 'splitTokenOnT1',
          priority: 2,
          data: [
            { source: 'p1', target: 'p3', predicate: null, capacity: 1 },
            { source: 'p1', target: 'p4', predicate: null, capacity: 1 },
            {
              source: 'p1',
              target: 'p5',
              predicate: 'returnFalse',
              capacity: 1,
            },
            { source: 'p2', target: 'p3', predicate: null, capacity: 1 },
            { source: 'p2', target: 'p4', predicate: null, capacity: 1 },
            { source: 'p2', target: 'p5', predicate: null, capacity: 1 },
          ],
        },
        {
          id: 'T2',
          name: 'T_2',
          splitFunction: null,
          priority: 1,
          data: [
            {
              source: 'p4',
              target: 'p6',
              predicate: 'returnTrue',
              capacity: 2,
            },
          ],
        },
        {
          id: 'T3',
          name: 'T_3',
          splitFunction: 'returnTrue',
          priority: 1,
          data: [
            {
              source: 'p6',
              target: 'p7',
              predicate: 'returnTrue',
              capacity: 2,
            },
            {
              source: 'p6',
              target: 'p1',
              predicate: 'returnTrue',
              capacity: 2,
            },
          ],
        },
      ],
      tokens: [
        {
          id: 'token1',
          name: 'token_1',
          host: 'p1',
          priority: 1,
          initialChars: {
            a: 1,
            b: { prop: 1 },
            c: new Date(),
            d: [1, 2],
          },
        },
        {
          id: 'token2',
          name: 'token_2',
          host: 'p4',
          priority: 3,
          initialChars: {},
        },
        {
          id: 'token3',
          name: 'token_3',
          host: 'p1',
          priority: 2,
          initialChars: {},
        },
      ],
    };
  }
}
