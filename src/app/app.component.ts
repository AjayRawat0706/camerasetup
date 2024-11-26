import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  videoElement!: HTMLVideoElement;
  stream!: MediaStream;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio
  capturedImage: string | null = null;

  // Aspect ratio mappings for width/height ratios
  aspectRatioMap: any = {
    '4:3': { width: 4, height: 3 },
    '16:9': { width: 16, height: 9 },
    '1:1': { width: 1, height: 1 }
  };

  ngOnInit() {
    this.setupCamera();
  }

  // Set up the camera stream
  setupCamera() {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement = document.querySelector('#video')!;
        this.videoElement.srcObject = stream;
        this.updateVideoAspectRatio(); // Set initial aspect ratio
      })
      .catch((error) => {
        console.error('Error accessing the camera: ', error);
      });
  }

  // Change aspect ratio based on selection
  changeAspectRatio() {
    this.updateVideoAspectRatio();
  }

  // Update the video element based on the selected aspect ratio
  updateVideoAspectRatio() {
    const aspect = this.aspectRatioMap[this.selectedAspectRatio];
    const videoWidth = window.innerWidth * 0.9; // 90% of screen width
    const videoHeight = Math.floor((videoWidth * aspect.height) / aspect.width);

    // Apply aspect ratio style to the video element
    this.videoElement.style.width = `${videoWidth}px`;
    this.videoElement.style.height = `${videoHeight}px`;
    this.videoElement.style.objectFit = 'cover'; // Ensures the video is cropped

    // Update constraints to match aspect ratio
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: videoWidth },
        height: { ideal: videoHeight }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error updating camera constraints: ', error);
      });
  }

  // Capture the image from the video feed
  captureImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context is unavailable.');
      return;
    }

    // Get the current aspect ratio
    const aspect = this.aspectRatioMap[this.selectedAspectRatio];

    // Capture only the visible part of the video element
    const videoRect = this.videoElement.getBoundingClientRect();
    const width = videoRect.width;
    const height = Math.floor((width * aspect.height) / aspect.width);
    canvas.width = width;
    canvas.height = height;

    // Draw the video frame to the canvas
    context.drawImage(this.videoElement, 0, 0, width, height, 0, 0, width, height);

    // Convert the canvas to an image
    this.capturedImage = canvas.toDataURL('image/jpeg');
  }

  // Download the captured image
  downloadImage() {
    if (this.capturedImage) {
      const link = document.createElement('a');
      link.href = this.capturedImage;
      link.download = 'captured_image.jpg';
      link.click();
    }
  }
}
