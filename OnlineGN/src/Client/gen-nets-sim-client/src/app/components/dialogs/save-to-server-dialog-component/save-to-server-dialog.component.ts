import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { GenNetExportModel } from 'src/app/models/gen-net-export.model';
import { GenNetHttpService } from 'src/app/services/gen-net-http.service';
import { BaseLoadableComponent } from 'src/app/utils/base-loadable-component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'save-to-server-dialog',
  templateUrl: './save-to-server-dialog.component.html',
  styleUrls: ['./save-to-server-dialog.component.scss'],
})
export class SaveToServerDialogComponent
  extends BaseLoadableComponent
  implements OnInit
{
  private toastr = inject(ToastrService);
  private genNetHttpService = inject(GenNetHttpService);
  private exportModel: GenNetExportModel = inject(MAT_DIALOG_DATA);

  protected genNetId = '';

  ngOnInit(): void {
    this.saveToServer();
  }

  protected get genNetUrl(): string {
    if (!this.genNetId) {
      return 'none';
    }
    return environment.baseUrl + '/genNets/' + this.genNetId;
  }

  protected saveToServer(): void {
    this.loadingUntilComplete(
      this.genNetHttpService.saveGenNet(this.exportModel),
    ).subscribe({
      next: (id) => {
        this.genNetId = id;
        this.toastr.success('Saved to server with id: ' + id);
      },
      error: (err) => {
        this.toastr.error(
          'Error while saving to server: ' + JSON.stringify(err.error),
        );
      },
    });
  }

  protected copyToClipboard() {
    navigator.clipboard.writeText(this.genNetUrl).then(
      () => {
        this.toastr.success('Link copied to clipboard');
      },
      (err) => {
        this.toastr.error('Error while copying link: ' + err);
      },
    );
  }
}
