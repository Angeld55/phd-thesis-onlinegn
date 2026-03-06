import { TestBed } from '@angular/core/testing';
import { StepLoggerService } from './step-logger.service';

describe('StepLoggerService', () => {
  let service: StepLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty logs array', () => {
    expect(service.logs).toEqual([]);
  });

  it('should add a log entry', () => {
    service.add('Test log');
    expect(service.logs).toEqual(['Test log']);
  });

  it('should add multiple log entries', () => {
    service.add('First log');
    service.add('Second log');
    expect(service.logs).toEqual(['First log', 'Second log']);
  });

  it('should clear all log entries', () => {
    service.add('Log to clear');
    service.clear();
    expect(service.logs).toEqual([]);
  });
});
