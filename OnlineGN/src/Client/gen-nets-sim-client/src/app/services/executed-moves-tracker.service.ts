export class ExecutedMovesTracker {
  private executedMovesCounter: {
    [sourceId: string]: { [targetId: string]: number };
  } = {};

  public addMove(sourcePlaceId: string, targetPlaceId: string) {
    if (!this.executedMovesCounter[sourcePlaceId]) {
      this.executedMovesCounter[sourcePlaceId] = {};
    }
    if (!this.executedMovesCounter[sourcePlaceId][targetPlaceId]) {
      this.executedMovesCounter[sourcePlaceId][targetPlaceId] = 0;
    }
    this.executedMovesCounter[sourcePlaceId][targetPlaceId]++;
  }

  public getCount(sourcePlaceId: string, targetPlaceId: string) {
    return this.executedMovesCounter[sourcePlaceId]?.[targetPlaceId] || 0;
  }
  public getCountForSource(sourcePlaceId: string) {
    if (!this.executedMovesCounter[sourcePlaceId]) {
      return 0;
    }
    let result = 0;
    for (const targetPlaceId in this.executedMovesCounter[sourcePlaceId]) {
      result += this.executedMovesCounter[sourcePlaceId][targetPlaceId] || 0;
    }
    return result;
  }
  public getCountToTarget(targetPlaceId: string) {
    let result = 0;
    for (const sourcePlaceId in this.executedMovesCounter) {
      result += this.executedMovesCounter[sourcePlaceId][targetPlaceId] || 0;
    }
    return result;
  }
  public resetCounter() {
    this.executedMovesCounter = {};
  }
}
