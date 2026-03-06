import { ToastrService } from 'ngx-toastr';
import { CustomFunction } from '../models/custom-function.model';
import { TokenMoverService } from './token-mover.service';
import { Injectable } from '@angular/core';
import { GenNetRaw } from '../models/gen-net.model';

@Injectable()
export class CodeCompilerServiceFactory {
  constructor(private toastr: ToastrService) {}
  public create(
    tokenMover: TokenMoverService,
    initialCode: string,
    genNetRaw: GenNetRaw,
  ) {
    return new CodeCompilerService(
      this.toastr,
      tokenMover,
      initialCode,
      genNetRaw,
    );
  }
}

export class CodeCompilerService {
  private _globalCode: string = '';
  private readonly globalObj: any = {};

  // TODO: change to map
  public customFunctions: CustomFunction[] = [];

  private static readonly FUNCTIONS_REGEX = new RegExp(
    /(\w+):\s*function\s*\([^)]*\)\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g,
  );

  constructor(
    private toastr: ToastrService,
    // used in the compiled code!!!
    private tokenMover: TokenMoverService,
    initialCode: string,
    private genNetRaw: GenNetRaw,
  ) {
    this.compileCode(initialCode);
  }

  public get globalCode() {
    return this._globalCode;
  }

  public compileCode(code: string) {
    this._globalCode = code;
    try {
      eval(code);
    } catch (e: any) {
      this.toastr.error(e.message, 'Error during code compilation');
      return;
    }

    this.customFunctions = [];
    const matches = code.matchAll(CodeCompilerService.FUNCTIONS_REGEX);
    for (const match of matches) {
      this.customFunctions.push({
        name: match[1],
        code: match[0],
      });
    }
    this.removeDeletedFunctionsFromGenNet();
    this.toastr.success('Code compiled successfully');
  }

  public removeDeletedFunctionsFromGenNet() {
    this.genNetRaw.places.forEach((place) => {
      if (!this.hasFunction(place.charFunc)) {
        place.charFunc = null;
      }
      if (!this.hasFunction(place.mergeFunction)) {
        place.mergeFunction = null;
      }
    });

    this.genNetRaw.transitions.forEach((transition) => {
      if (!this.hasFunction(transition.splitFunction)) {
        transition.splitFunction = null;
      }
      transition.data.forEach((item) => {
        if (!this.hasFunction(item.predicate)) {
          item.predicate = null;
        }
      });
    });
  }

  public executeCustomFunction<T>(
    functionName: string,
    ...args: any[]
  ): T | undefined {
    if (!this.hasFunction(functionName)) {
      return undefined;
    }

    try {
      return this.globalObj[functionName](...args);
    } catch (e: any) {
      this.toastr.error(e.message, `Error in custom function: ${functionName}`);
      return undefined;
    }
  }

  private hasFunction(functionName: string | null): boolean {
    if (!functionName) {
      return false;
    }
    return !!this.globalObj[functionName];
  }
}
