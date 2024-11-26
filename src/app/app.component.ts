import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-root',
  standalone: true,  // Standalone component
  imports: [FormsModule],  // Import FormsModule for ngModel
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  videoElement!: HTMLVideoElement;
  stream!: MediaStream;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio
  capturedImage: string | null = null; // Variable to hold captured image data

  ngOnInit() {
    // Setup the camera stream when component is initialized
    this.setupCamera();
  }

  ngAfterViewInit() {
    // DOM-dependent initialization can be done here
  }

  setupCamera() {
    // Default camera resolution (ideal resolution)
    const constraints = {
      video: {
        facingMode: 'user',
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
    this.updateVideoAspectRatio(); // Update the aspect ratio when changed
  }

  updateVideoAspectRatio() {
    // Set the video resolution and element size based on the selected aspect ratio
    let width, height;
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

    // Set the ideal width and height for the camera resolution (ideal resolution)
    const idealWidth = 1280;
    const idealHeight = Math.floor((idealWidth * aspectRatioHeight) / aspectRatioWidth);

    // Apply the video constraints for camera feed
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: idealWidth },
        height: { ideal: idealHeight }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement.srcObject = stream;

        // Update the video element size based on the selected aspect ratio
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

    // Adjust the object-fit to ensure the video is contained within the given aspect ratio without distortion
    this.videoElement.style.objectFit = 'cover';  // Ensures the video fits the aspect ratio (may crop)
  }

  captureImage() {
    // Create a canvas element to capture the image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      const aspectRatio = this.selectedAspectRatio.split(':');
      const width = 640; // Fixed width for capturing image
      const height = (width * parseInt(aspectRatio[1])) / parseInt(aspectRatio[0]);

      canvas.width = width;
      canvas.height = height;

      context.drawImage(this.videoElement, 0, 0, width, height);
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
