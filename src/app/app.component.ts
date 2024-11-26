import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,  // Standalone component
  imports: [FormsModule, CommonModule],  // Import FormsModule for ngModel
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  videoElement!: HTMLVideoElement;
  stream!: MediaStream;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio
  capturedImage: string | null = null; // Variable to hold captured image data

  ngOnInit() {
    this.setupCamera();
  }

  ngAfterViewInit() {}

  setupCamera() {
    // Set the camera resolution and constraints
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },  // Ideal width
        height: { ideal: 720 }   // Ideal height
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement = document.querySelector('video')!;
        this.videoElement.srcObject = stream;
        this.updateVideoAspectRatio(); // Adjust the aspect ratio on stream start
      })
      .catch((error) => {
        console.error('Error accessing the camera: ', error);
      });
  }

  changeAspectRatio(ratio: string) {
    this.selectedAspectRatio = ratio;
    this.updateVideoAspectRatio();
  }

  updateVideoAspectRatio() {
    let aspectRatioWidth, aspectRatioHeight;
    switch (this.selectedAspectRatio) {
      case '16:9':
        aspectRatioWidth = 16;
        aspectRatioHeight = 9;
        break;
      case '4:3':
        aspectRatioWidth = 4;
        aspectRatioHeight = 3;
        break;
      case '1:1':
        aspectRatioWidth = 1;
        aspectRatioHeight = 1;
        break;
      default:
        aspectRatioWidth = 16;
        aspectRatioHeight = 9;
    }

    const idealWidth = 1280;
    const idealHeight = Math.floor((idealWidth * aspectRatioHeight) / aspectRatioWidth);

    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: idealWidth },
        height: { ideal: idealHeight }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement.srcObject = stream;
        this.updateVideoElementStyle(idealWidth, idealHeight);
      })
      .catch((error) => {
        console.error('Error updating the camera constraints: ', error);
      });
  }

  updateVideoElementStyle(width: number, height: number) {
    // Apply CSS to the video element to ensure it maintains the selected aspect ratio
    this.videoElement.style.width = `${width}px`;
    this.videoElement.style.height = `${height}px`;

    // Make sure the video fits the aspect ratio
    this.videoElement.style.objectFit = 'cover';  // Ensures the video is properly cropped or fit
  }

  captureImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Get the video element's size and position
    const videoRect = this.videoElement.getBoundingClientRect();
    
    // Extract the visible region of the video element (taking into account the objectFit cropping)
    const width = videoRect.width;
    const height = videoRect.height;

    // Set the canvas size to match the visible part of the video
    canvas.width = width;
    canvas.height = height;

    if (context) {
      // Draw only the visible portion of the video onto the canvas
      context.drawImage(this.videoElement, 
                        videoRect.x, videoRect.y, width, height, 
                        0, 0, width, height); // This ensures we capture only the visible part

      // Store the captured image as a data URL
      this.capturedImage = canvas.toDataURL('image/jpeg');
    } else {
      console.error('Canvas context is unavailable.');
    }
  }

  downloadImage() {
    if (this.capturedImage) {
      const link = document.createElement('a');
      link.href = this.capturedImage;
      link.download = 'captured_image.jpg';
      link.click();
    }
  }
}
