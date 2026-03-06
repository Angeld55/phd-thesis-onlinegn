import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { GenNetExportModel } from 'src/app/models/gen-net-export.model';
import { GenNetRaw } from 'src/app/models/gen-net.model';
import { GenNetSettings } from 'src/app/models/get-net-settings.model';
import { SettingsDialogComponent } from '../../dialogs/settings-dialog/settings-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TokensListDialogComponent } from '../../dialogs/tokens-list-dialog/tokens-list-dialog.component';
import { BASE_MODAL_CONFIG } from 'src/app/utils/base-modal.config';
import { TokenMoverService } from 'src/app/services/token-mover.service';
import { D3_CONTAINER_SELECTOR } from 'src/app/utils/contants';
import { LogsDialogComponentComponent } from '../../dialogs/logs-dialog-component/logs-dialog-component.component';
import { TexDialogComponent } from '../../dialogs/tex-dialog/tex-dialog.component';
import { GenNetHttpService } from 'src/app/services/gen-net-http.service';
import { BaseComponent } from 'src/app/utils/base-component';
import { ToastrService } from 'ngx-toastr';
import { SaveToServerDialogComponent } from '../../dialogs/save-to-server-dialog-component/save-to-server-dialog.component';

@Component({
  selector: 'header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
})
export class HeaderButtonsComponent extends BaseComponent {
  @Input({ required: true }) genNetRaw: GenNetRaw | null = null;
  @Input({ required: true }) settings: GenNetSettings | null = null;
  @Input({ required: true }) codeCompilerService: any | null = null;

  @Output() genNetImported = new EventEmitter<GenNetExportModel>();
  @Output() makeStep = new EventEmitter<void>();
  @Output() fullSimulation = new EventEmitter<void>();
  @Output() resetSimulation = new EventEmitter<void>();
  @Output() editPositions = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  private tokenMover = inject(TokenMoverService);
  private genNetHttpService = inject(GenNetHttpService);
  private toastr = inject(ToastrService);

  public get hasGenNet(): boolean {
    return !!this.genNetRaw;
  }

  //#region Tokens

  public showAllTokens() {
    this.dialog.open(TokensListDialogComponent, {
      ...BASE_MODAL_CONFIG,
      data: {
        tokens: this.tokenMover!.tokens,
      },
    });
  }

  //#endregion

  //#region Settings

  public openSettings() {
    this.dialog.open(SettingsDialogComponent, {
      ...BASE_MODAL_CONFIG,
      data: {
        settings: this.settings,
      },
    });
  }

  public openStepLogs() {
    this.dialog.open(LogsDialogComponentComponent, {
      ...BASE_MODAL_CONFIG,
    });
  }
  //#endregion

  //#region Import

  protected selectedFile: any = null;

  public onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;

    var reader = new FileReader();
    reader.onload = () => {
      const importedModel = JSON.parse(
        reader.result as string,
      ) as GenNetExportModel;

      this.genNetImported.emit(importedModel);
    };
    // TODO: not optimal for large files to use readAsText
    reader.readAsText(this.selectedFile);
  }

  //#endregion

  //#region Export

  public openSaveToServerDialog() {
    this.dialog.open(SaveToServerDialogComponent, {
      ...BASE_MODAL_CONFIG,
      width: '700px',
      data: this.generateExportData(),
    });
  }

  public exportToTex() {
    this.dialog.open(TexDialogComponent, {
      ...BASE_MODAL_CONFIG,
    });
  }

  public exportToFile() {
    const blob = this.generateExportBlob();
    this.downloadBlob(blob, 'export.json');
  }

  private generateExportData(): GenNetExportModel {
    const svg = document.querySelector(`${D3_CONTAINER_SELECTOR}>g>svg`);
    return {
      genNetRaw: this.genNetRaw!,
      settings: this.settings!,
      code: this.codeCompilerService!.globalCode,
      svg: svg?.outerHTML,
    };
  }

  private generateExportBlob(): Blob {
    const exportData = this.generateExportData();

    return new Blob([JSON.stringify(exportData)], { type: 'application/json' });
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  //#endregion
}
