import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { OtpResponse } from './interfaces/otpResponse.interface';
import { AppConstants } from './constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'VertivProject';

  userId: string = '';
  selectedDate: string = ''; // DateTime will be bound as string for input
  otpResponse: OtpResponse = { otp: '', remainingSeconds: 0 };
  enteredOtp: string = '';
  isValidOtp: boolean | null = null;
  remainingSeconds: number = 0;
  private countdownInterval: any; // Variable to hold interval reference

  constructor(private http: HttpClient) {
    this.selectedDate = this.formatDateTimeToLocal();
   }

   formatDateTimeToLocal(): string {
    const now = new Date();
  
    // Get the components of the local date and time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Format the local date-time string in the format "yyyy-MM-ddTHH:mm:ss"
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  
    // Set the dateTime variable with formatted value
    return formattedDateTime;
  }

  onDateChange(): void {
    if (!this.selectedDate) return;

    const selectedDate = new Date(this.selectedDate);
    const now = new Date();

    // If the selected date is today, update the time to the current time including seconds
    if (selectedDate.toDateString() === now.toDateString()) {
      const formattedDateTime = now.toISOString().slice(0, 19); // Format current date-time with seconds
      this.selectedDate = formattedDateTime;
    }
  }

  onSubmit(): void {
    if (this.userId && this.selectedDate) {
      // Convert the local dateTime to UTC
      const localDate = new Date(this.selectedDate); // Assuming dateTime is in local format
      //const utcDate = localDate.toISOString(); // Convert to ISO string in UTC format

      const requestPayload = {
        userId: this.userId,
        dateTime: localDate, // Send the UTC date to the backend
      };

      // Call the backend API to generate the OTP
      this.http.post<any>(`${AppConstants.BASE_URl}/Otp/GenerateOtpKey`, requestPayload).subscribe(
        (response) => {
          this.otpResponse = response;
          this.remainingSeconds = response.remainingSeconds;
          this.calculateOtpValidationTime();
        },
        (error) => {
          console.error('Error generating OTP', error);
        }
      );
    }
  }

  calculateOtpValidationTime(): void {
    // Clear any previous interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Update remainingSeconds every second
    this.countdownInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        clearInterval(this.countdownInterval); // Stop the timer when it reaches 0
      }
    }, 1000); // Run every 1000ms (1 second)
  }

  validateOtp(): void {
    const localDate = new Date(); // Assuming dateTime is in local format
    // const utcDate = localDate.toISOString();
    const requestPayload = {
      userId: this.userId,
      dateTime: localDate,
      otpCode: this.enteredOtp
    };
    this.http.post<any>(`${AppConstants.BASE_URl}/Otp/ValidateOtp`, requestPayload).subscribe(
      (response) => {
        this.isValidOtp = response;
      },
      (error) => {
        console.error('Error generating OTP', error);
      }
    );
  }
}
