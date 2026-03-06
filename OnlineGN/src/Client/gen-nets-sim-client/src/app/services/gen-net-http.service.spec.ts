import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GenNetHttpService } from './gen-net-http.service';
import { GenNetExportModel } from '../models/gen-net-export.model';
import { environment } from 'src/environments/environment';

describe('GenNetHttpService', () => {
  let service: GenNetHttpService;
  let httpMock: HttpTestingController;

  const mockGenNet: GenNetExportModel = {
    // Add properties of GenNetExportModel here for testing
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GenNetHttpService],
    });

    service = TestBed.inject(GenNetHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch a GenNet by ID', () => {
    const mockResponse = {
      id: '123',
      content: mockGenNet,
      lastFetchedAt: new Date(),
    };

    service.getGenNetById('123').subscribe((genNet) => {
      expect(genNet).toEqual(mockGenNet);
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/genNets/123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should save a GenNet and return its ID', () => {
    const mockResponse = { id: '123' };

    service.saveGenNet(mockGenNet).subscribe((id) => {
      expect(id).toBe('123');
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/genNets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: mockGenNet });
    req.flush(mockResponse);
  });
});
