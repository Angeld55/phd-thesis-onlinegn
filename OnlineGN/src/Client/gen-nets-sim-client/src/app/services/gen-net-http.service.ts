import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GenNetExportModel } from '../models/gen-net-export.model';
import { environment } from 'src/environments/environment';

type GenNetResponse = {
  id: string;
  content: GenNetExportModel;
  lastFetchedAt: Date;
};

type GenNetSaveResponse = {
  id: string;
};

@Injectable()
export class GenNetHttpService {
  private readonly baseApiUrl: string = environment.baseApiUrl + '/genNets';

  private httpClient: HttpClient = inject(HttpClient);

  public getGenNetById(id: string): Observable<GenNetExportModel> {
    return this.httpClient
      .get<GenNetResponse>(`${this.baseApiUrl}/${id}`)
      .pipe(map((response) => response.content));
  }

  public saveGenNet(genNet: GenNetExportModel): Observable<string> {
    return this.httpClient
      .post<GenNetSaveResponse>(`${this.baseApiUrl}`, {
        content: genNet,
      })
      .pipe(map((response) => response.id));
  }
}
