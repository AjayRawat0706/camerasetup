import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Import FormsModule for ngModel
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  videoElement!: HTMLVideoElement;
  stream!: MediaStream;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio
  capturedImage: string | null = null; // Variable to hold captured image data
  currentCamera: string = 'user'; // Default to front camera
  mediaDevices: MediaDeviceInfo[] = []; // Store available media devices

  ngOnInit() {
    this.setupCamera();
    this.getMediaDevices();
  }

  ngAfterViewInit() {}

  // Get all media devices (including cameras)
  getMediaDevices() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.mediaDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras: ', this.mediaDevices);
      })
      .catch(error => {
        console.error('Error getting media devices:', error);
      });
  }

  // Setup the camera with the initial constraints (front camera)
  setupCamera() {
    const constraints = {
      video: {
        facingMode: this.currentCamera,  // Default to front camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement = document.querySelector('video')!;
        this.videoElement.srcObject = stream;
        this.updateVideoAspectRatio();
      })
      .catch((error) => {
        console.error('Error accessing the camera: ', error);
      });
  }

  // Change the aspect ratio when the user selects a different ratio
  changeAspectRatio(ratio: string) {
    this.selectedAspectRatio = ratio;
    this.updateVideoAspectRatio();
  }

  // Update video element dimensions based on the selected aspect ratio
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
        facingMode: this.currentCamera,
        width: { ideal: idealWidth },
        height: { ideal: idealHeight }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream.getTracks().forEach(track => track.stop());  // Stop the current stream
        this.stream = stream;
        this.videoElement.srcObject = stream;
        this.updateVideoElementStyle(idealWidth, idealHeight);
      })
      .catch((error) => {
        console.error('Error updating the camera constraints: ', error);
      });
  }

  // Apply styles to ensure the video fits the selected aspect ratio
  updateVideoElementStyle(width: number, height: number) {
    this.videoElement.style.width = `${width}px`;
    this.videoElement.style.height = `${height}px`;
    this.videoElement.style.objectFit = 'cover'; // Avoid stretching or distortion
  }

  // Switch between front and back camera
  switchCamera() {
    this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user'; // Toggle between front and back cameras
    this.setupCamera();  // Restart camera with the new facing mode
  }

  // Capture image from the video feed and store it as base64 string
  captureImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const aspectRatio = this.selectedAspectRatio.split(':');
    const width = this.videoElement.videoWidth; // Use the current video width
    const height = (width * parseInt(aspectRatio[1])) / parseInt(aspectRatio[0]);

    canvas.width = width;
    canvas.height = height;

    if (context) {
      // Draw the visible portion of the video (only the part shown in the video element)
      const videoRect = this.videoElement.getBoundingClientRect();
      context.drawImage(
        this.videoElement,
        videoRect.x, videoRect.y, videoRect.width, videoRect.height, // Crop the video to match the visible portion
        0, 0, width, height // Draw the cropped video onto the canvas
      );
      this.capturedImage = canvas.toDataURL('image/jpeg');
    } else {
      console.error('Canvas context is unavailable.');
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
