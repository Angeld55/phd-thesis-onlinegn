import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GenNetSettings } from 'src/app/models/get-net-settings.model';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
})
export class SettingsDialogComponent {
  protected settings: GenNetSettings;
  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: { settings: GenNetSettings },
  ) {
    this.settings = data.settings;
  }
}
