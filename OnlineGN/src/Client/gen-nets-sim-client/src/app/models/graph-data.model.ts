import { Place, Transition, TransitionItem } from './gen-net.model';

export interface GraphNode {
  name: string;
  type: 'node' | 'transition';
}

export interface MovingToken {
  id: string;
  name: string;
  currentPositionsId: string;
  priority: number;
  chars: { [key: string]: any };
}

export interface GenNetGraphData {
  transitions: { [transitionId: string]: Transition };
  transitionsSortedByPriority: Transition[];
  placeMap: { [placeId: string]: Place };
  placeIdToTransitionId: { [placeId: string]: string };
  placeIdToTransitionItems: {
    [fromPlaceId: string]: TransitionItem[];
  };
  placeIdToPreviousTransitionId: {
    [placeId: string]: string;
  };
  transitionToSourcePlaces: {
    [transitionId: string]: Place[];
  };
  tokens: MovingToken[];
}
