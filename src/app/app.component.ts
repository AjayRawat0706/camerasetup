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
      const constraints = {
        video: {
          facingMode: 'environment', // Use the back camera
          width: { min: 640, ideal: 1280, max: 1920 }, // Specify width range
          height: { min: 480, ideal: 960, max: 1080 }, // Specify height range
          aspectRatio: 4 / 3, // Enforce 4:3 aspect ratio
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if stream is received
      if (!stream) {
        throw new Error('No video stream available');
      }

      // Set the video element's source object to the stream
      this.videoElement.nativeElement.srcObject = stream;

      // Log the video stream for debugging
      console.log('Video stream started successfully');

    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Error accessing the camera. Please check permissions and try again.');
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
  
  

