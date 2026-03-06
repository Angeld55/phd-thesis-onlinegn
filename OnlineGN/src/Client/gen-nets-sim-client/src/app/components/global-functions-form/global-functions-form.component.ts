import { Component, Input, OnChanges } from '@angular/core';
import { CodeCompilerService } from 'src/app/services/code-compiler.service';

@Component({
  selector: 'global-functions-form',
  templateUrl: './global-functions-form.component.html',
  styleUrls: ['./global-functions-form.component.scss'],
})
export class GlobalFunctionsFormComponent implements OnChanges {
  @Input({ required: true }) public codeCompilerService!: CodeCompilerService;
  public globalCode: string = '';

  ngOnChanges() {
    if (this.codeCompilerService) {
      this.globalCode = this.codeCompilerService.globalCode;
    }
  }

  public get hasCode(): boolean {
    return !!this.globalCode && this.globalCode.length > 0;
  }

  public compileCode() {
    this.codeCompilerService.compileCode(this.globalCode);
    this.globalCode = this.codeCompilerService.globalCode;
  }
}
