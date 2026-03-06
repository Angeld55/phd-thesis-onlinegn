import { Component } from '@angular/core';
import { StepLoggerService } from 'src/app/services/step-logger.service';

@Component({
  selector: 'app-logs-dialog-component',
  templateUrl: './logs-dialog-component.component.html',
  styleUrls: ['./logs-dialog-component.component.scss'],
})
export class LogsDialogComponentComponent {
  constructor(protected logger: StepLoggerService) {}
}
