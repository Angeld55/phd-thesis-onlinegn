import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StepLoggerService {
  private _logs: string[] = [];

  public get logs(): string[] {
    return this._logs;
  }

  public add(log: string): void {
    this._logs.push(log);
  }

  public clear(): void {
    this._logs = [];
  }
}
