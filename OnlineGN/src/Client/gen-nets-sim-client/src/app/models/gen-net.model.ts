export interface GenNetRaw {
  places: Place[];
  transitions: Transition[];
  tokens: Token[];
}

export interface Place {
  id: string;
  name: string;
  charFunc: string | null;
  mergeFunction: string | null;
  priority: number;
  capacity: number;
}

export interface TransitionItem {
  source: string;
  target: string;
  predicate: string | null;
  capacity: number;
}

export interface Transition {
  id: string;
  name: string;
  splitFunction: string | null;
  data: TransitionItem[];
  priority: number;
}

export interface Token {
  id: string;
  name: string;
  host: string;
  priority: number;
  initialChars: { [key: string]: any };
}
