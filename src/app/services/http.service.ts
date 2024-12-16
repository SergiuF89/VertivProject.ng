import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { AppConstants } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  generateOtp(requestPayload: any): Observable<any> {
    return this.http.post<any>(`${AppConstants.BASE_URl}/${AppConstants.GENERATE_OTP}`, requestPayload);
  }

  validateOtp(requestPayload: any): Observable<any> {
    return this.http.post<any>(`${AppConstants.BASE_URl}/${AppConstants.VALIDATE_OTP}`, requestPayload);
  }
}
