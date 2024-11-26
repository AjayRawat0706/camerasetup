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
  mediaRecorder!: MediaRecorder;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio
  capturedImage: string | null = null;
  aspectRatioMap: any = {
    '4:3': { width: 4, height: 3 },
    '16:9': { width: 16, height: 9 },
    '1:1': { width: 1, height: 1 }
  };

  ngOnInit() {
    this.setupCamera();
  }

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

  changeAspectRatio() {
    this.updateVideoAspectRatio();
  }

  // Update the video size based on the selected aspect ratio
  updateVideoAspectRatio() {
    const aspect = this.aspectRatioMap[this.selectedAspectRatio];
    const videoWidth = window.innerWidth * 0.9; // 90% of screen width
    const videoHeight = Math.floor((videoWidth * aspect.height) / aspect.width);

    // Apply aspect ratio style to the video element
    this.videoElement.style.width = `${videoWidth}px`;
    this.videoElement.style.height = `${videoHeight}px`;
    this.videoElement.style.objectFit = 'cover'; // Ensures the video is cropped to fit the container
  }

  // Capture the image from the video feed using MediaRecorder
  captureImage() {
    // Create a canvas to draw the captured image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Get the visible video area (container width and height)
    const videoContainer = document.querySelector('#video') as HTMLElement;
    const containerWidth = videoContainer.offsetWidth;
    const containerHeight = videoContainer.offsetHeight;

    // Set canvas size to match visible video size
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Ensure we are drawing the visible part of the video
    if (context) {
      // Draw the current frame of the video onto the canvas
      context.drawImage(this.videoElement, 0, 0, containerWidth, containerHeight);
      // Convert the canvas content to a data URL (image)
      this.capturedImage = canvas.toDataURL('image/jpeg');
    }
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
