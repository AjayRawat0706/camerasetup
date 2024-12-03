import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  capturedImage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.startCamera();
  }

  // Start the camera with a specified aspect ratio
  async startCamera() {
    try {
      // Request a video stream with a specific aspect ratio (4:3 for example)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },      // Ideal width
          height: { ideal: 960 },     // Ideal height for 4:3 aspect ratio
          aspectRatio: 4 / 3          // Enforce 4:3 aspect ratio
        }
      });

      // Set the video element's source object to the stream
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }

  // Capture the image and save it
  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions based on the video element's dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Save the captured image as a base64 data URL
    this.capturedImage = canvas.toDataURL('image/png');
  }

  // Download the captured image
  downloadImage() {
    if (this.capturedImage) {
      const a = document.createElement('a');
      a.href = this.capturedImage;
      a.download = 'captured-image.png';
      a.click();
    }
  }
  }
  
  

