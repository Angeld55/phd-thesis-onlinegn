import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import {
  CodeCompilerService,
  CodeCompilerServiceFactory,
} from './code-compiler.service';
import { TokenMoverService } from './token-mover.service';
import { GenNetRaw } from '../models/gen-net.model';

describe('CodeCompilerService', () => {
  let toastrService: jasmine.SpyObj<ToastrService>;
  let tokenMoverService: jasmine.SpyObj<TokenMoverService>;
  let genNetRaw: GenNetRaw;
  let service: CodeCompilerService;

  beforeEach(() => {
    toastrService = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    tokenMoverService = jasmine.createSpyObj('TokenMoverService', [
      'moveTokens',
    ]);
    genNetRaw = {
      places: [
        { charFunc: 'charFunc1', mergeFunction: 'mergeFunc1' } as any,
        { charFunc: null, mergeFunction: 'mergeFunc2' } as any,
      ],
      transitions: [
        {
          splitFunction: 'splitFunc1',
          data: [{ predicate: 'predicate1' }, { predicate: null } as any],
        } as any,
      ],
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastrService, useValue: toastrService },
        { provide: TokenMoverService, useValue: tokenMoverService },
      ],
    });

    const factory = new CodeCompilerServiceFactory(toastrService);
    service = factory.create(tokenMoverService, '', genNetRaw);
  });

  it('should compile valid code and extract custom functions', () => {
    const code = `
    this.globalObj = {
            testFunc: function(a, b) {
                return a + b;
            }
  };
        `;
    service.compileCode(code);

    expect(service.globalCode).toBe(code);
    expect(service.customFunctions.length).toBe(1);
    expect(service.customFunctions[0].name).toBe('testFunc');
    expect(toastrService.success).toHaveBeenCalledWith(
      'Code compiled successfully',
    );
  });

  it('should handle invalid code gracefully', () => {
    const code = `
            invalidFunc: function() {
                throw new Error('Compilation error');
            }
        `;
    service.compileCode(code);

    expect(service.globalCode).toBe(code);
    expect(service.customFunctions.length).toBe(0);
    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should remove deleted functions from GenNetRaw', () => {
    const code = `
            charFunc1: function() {},
            splitFunc1: function() {}
        `;
    service.compileCode(code);
    service.removeDeletedFunctionsFromGenNet();

    expect(genNetRaw.places[0].charFunc).toBeFalsy();
    expect(genNetRaw.places[0].mergeFunction).toBeNull();
    expect(genNetRaw.transitions[0].splitFunction).toBeFalsy();
    expect(genNetRaw.transitions[0].data[0].predicate).toBeNull();
  });

  it('should execute a valid custom function', () => {
    const code = `
    this.globalObj = {
            testFunc: function(a, b) {
                return a + b;
            }
  };
        `;
    service.compileCode(code);

    const result = service.executeCustomFunction<number>('testFunc', 2, 3);
    expect(result).toBe(5);
  });

  it('should handle execution of a non-existent custom function', () => {
    const result = service.executeCustomFunction<number>('nonExistentFunc');
    expect(result).toBeUndefined();
  });
});
