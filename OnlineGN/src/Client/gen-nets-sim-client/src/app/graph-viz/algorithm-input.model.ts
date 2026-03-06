export interface AlgorithmInput {
  places: AlgorithmPlace[];
}

export interface AlgorithmPlace {
  name: string;
  beginTransition?: string;
  endTransition?: string;
}
