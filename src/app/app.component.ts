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
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  capturedImage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.startCamera();
  }

  // Start the camera and display the video stream
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }

  // Capture image and maintain aspect ratio
  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');

    // Set the desired aspect ratio (e.g., 4:3)
    const aspectRatio = 4 / 3;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    let width = videoWidth;
    let height = videoWidth / aspectRatio;

    if (height > videoHeight) {
      height = videoHeight;
      width = videoHeight * aspectRatio;
    }

    // Center the image on the canvas
    const offsetX = (videoWidth - width) / 2;
    const offsetY = (videoHeight - height) / 2;

    // Draw the video frame onto the canvas
    ctx?.drawImage(video, offsetX, offsetY, width, height, 0, 0, canvas.width, canvas.height);

    // Get the image data URL
    this.capturedImage = canvas.toDataURL('image/png');
  }

  // Allow user to download the captured image
  downloadImage() {
    if (this.capturedImage) {
      const a = document.createElement('a');
      a.href = this.capturedImage;
      a.download = 'captured-image.png';
      a.click();
    }
  }
}
