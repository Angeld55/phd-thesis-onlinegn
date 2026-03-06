import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GenNetService } from './services/gen-net.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphEngineServiceFactory } from './services/graph-engine.service';
import { PlaceDialogComponent } from './components/dialogs/place-dialog/place-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { GlobalFunctionsFormComponent } from './components/global-functions-form/global-functions-form.component';
import { CodeCompilerServiceFactory } from './services/code-compiler.service';
import { TokensListDialogComponent } from './components/dialogs/tokens-list-dialog/tokens-list-dialog.component';
import { TransitionDialogComponent } from './components/dialogs/transition-dialog/transition-dialog.component';
import { SettingsDialogComponent } from './components/dialogs/settings-dialog/settings-dialog.component';
import { HeaderButtonsComponent } from './components/gen-net-page/header-buttons/header-buttons.component';
import { ToastrModule } from 'ngx-toastr';
import { PositionChangerComponent } from './components/position-changer/position-changer.component';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { PredicateMatrixViewComponent } from './components/predicate-matrix-view/predicate-matrix-view.component';
import { MatTableModule } from '@angular/material/table';
import { LogsDialogComponentComponent } from './components/dialogs/logs-dialog-component/logs-dialog-component.component';
import { TexDialogComponent } from './components/dialogs/tex-dialog/tex-dialog.component';
import { TooltipPredicateMatrixViewComponent } from './components/predicate-matrix-view/tooltip/tooltip-predicate-matrix-view.component';
import { DialogPredicateMatrixViewComponent } from './components/predicate-matrix-view/dialog/dialog-predicate-matrix-view.component';
import { GenNetHttpService } from './services/gen-net-http.service';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { GenNetPageComponent } from './components/gen-net-page/gen-net-page.component';
import { HttpClientModule } from '@angular/common/http';
import { SaveToServerDialogComponent } from './components/dialogs/save-to-server-dialog-component/save-to-server-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    PlaceDialogComponent,
    GlobalFunctionsFormComponent,
    TransitionDialogComponent,
    TokensListDialogComponent,
    SettingsDialogComponent,
    HeaderButtonsComponent,
    PositionChangerComponent,
    PredicateMatrixViewComponent,
    TooltipPredicateMatrixViewComponent,
    DialogPredicateMatrixViewComponent,
    SaveToServerDialogComponent,
    LogsDialogComponentComponent,
    TexDialogComponent,
    GenNetPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    CdkDrag,
    CdkDropList,
    ToastrModule.forRoot(),
    MatTableModule,
    HttpClientModule,
    RouterModule.forRoot(APP_ROUTES, {
      bindToComponentInputs: true,
    }),
  ],
  providers: [
    GenNetService,
    GraphEngineServiceFactory,
    CodeCompilerServiceFactory,
    GenNetHttpService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
