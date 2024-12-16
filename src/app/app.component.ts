import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { OtpResponse } from './interfaces/otpResponse.interface';
import { AppConstants } from './constants';
import { CommonModule } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { HttpService } from './services/http.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'VertivProject';
  otpRequestDuplication: boolean = false;
  userId: string = '';
  private previousUserId: string = '';
  private previousSelectedDate: string = '';
  selectedDate: string = ''; // DateTime will be bound as string for input
  otpResponse: OtpResponse = { otp: '', remainingSeconds: 0, otpCode: '' };
  enteredOtp: string = '';
  isValidOtp: boolean | null = null;
  remainingSeconds: number = 0;
  private countdownInterval: any; // Variable to hold interval reference

  constructor(private http: HttpClient, private httpService: HttpService) {
    // this.selectedDate = this.formatDateTimeToLocal();
  }

  formatDateTimeToLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    // Format the local date-time string in the format "yyyy-MM-ddTHH:mm:ss"
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    // Set the dateTime variable with formatted value
    return formattedDateTime;
  }

  onSubmit(): void {
    if (this.userId && this.selectedDate) {
      const requestPayload = {
        userId: this.userId,
        dateTime: new Date(this.selectedDate), // set this.selectedDate as param if input date is required for validation
      };

      if (this.previousUserId === this.userId && this.previousSelectedDate === this.selectedDate) {
        this.otpRequestDuplication = true;
        return;
      }

      this.httpService.generateOtp(requestPayload).pipe(
        tap((response) => {
          this.otpResponse = response;
          this.remainingSeconds = response.remainingSeconds;
          this.previousUserId = this.userId;
          this.previousSelectedDate = this.selectedDate;
          this.otpRequestDuplication = false;
          this.calculateOtpValidationTime();
        }),
        catchError((error) => {
          console.error('Error generating OTP', error);
          return of(null);
        })
      )
      .subscribe();
    }
  }

  calculateOtpValidationTime(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  copyOtpCode(otpCode: string): void {
    if (otpCode) {
      // Create a temporary textarea element to copy the OTP code
      const textarea = document.createElement('textarea');
      textarea.value = otpCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  validateOtp(): void {
    const requestPayload = {
      userId: this.userId,
      dateTime: new Date(),
      otpCode: this.otpResponse.otpCode,
      otp: this.otpResponse.otp,
      userInputOtpCode: this.enteredOtp,
    };
    this.httpService
      .validateOtp(requestPayload)
      .pipe(
        tap((response) => {
          this.isValidOtp = response;
        }),
        catchError((error) => {
          console.error('Error validating OTP', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
