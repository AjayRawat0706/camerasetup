import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas'; // Import html2canvas

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

  // Change aspect ratio based on selection
  changeAspectRatio() {
    this.updateVideoAspectRatio();
  }

  // Update video element based on the selected aspect ratio
  updateVideoAspectRatio() {
    const aspect = this.aspectRatioMap[this.selectedAspectRatio];
    const videoWidth = window.innerWidth * 0.9; // 90% of screen width
    const videoHeight = Math.floor((videoWidth * aspect.height) / aspect.width);

    // Apply aspect ratio style to the video element
    this.videoElement.style.width = `${videoWidth}px`;
    this.videoElement.style.height = `${videoHeight}px`;
    this.videoElement.style.objectFit = 'cover'; // Ensures the video is cropped to fit the container
  }

  // Capture the image from the video feed using html2canvas
  captureImage() {
    const videoContainer = document.querySelector('#video-container') as HTMLElement;

    // Get the size of the video container (the visible portion of the video)
    const containerWidth = videoContainer.offsetWidth;
    const containerHeight = videoContainer.offsetHeight;

    // Ensure html2canvas captures the visible part of the video
    html2canvas(videoContainer, {
      width: containerWidth,
      height: containerHeight,
      x: 0,
      y: 0
    }).then((canvas) => {
      // Capture the canvas as an image
      this.capturedImage = canvas.toDataURL('image/jpeg');
    });
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
