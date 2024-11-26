import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-root',
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
    // Default camera resolution (can be updated based on selected ratio later)
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },  // Ideal width for the camera
        height: { ideal: 720 }   // Ideal height for the camera
      }
    };

    // Access the user's camera
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
    // Update the selected aspect ratio and adjust the video resolution accordingly
    this.selectedAspectRatio = ratio;
    this.updateVideoAspectRatio();
  }

  updateVideoAspectRatio() {
    // Update video constraints based on the selected aspect ratio
    let width, height;

    switch (this.selectedAspectRatio) {
      case '16:9':
        width = 1280;
        height = 720;
        break;
      case '4:3':
        width = 1280;
        height = 960;
        break;
      case '1:1':
        width = 720;
        height = 720;
        break;
      default:
        width = 1280;
        height = 720;
    }

    // Apply the new constraints
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: width },
        height: { ideal: height }
      }
    };

    // Restart the video stream with the updated constraints
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement.srcObject = stream;
        this.updateVideoElementStyle(width, height); // Adjust video element CSS
      })
      .catch((error) => {
        console.error('Error updating the camera constraints: ', error);
      });
  }

  updateVideoElementStyle(width: number, height: number) {
    // Set the video element dimensions to match the selected aspect ratio
    this.videoElement.style.width = `${width}px`;
    this.videoElement.style.height = `${height}px`;
  }

  captureImage() {
    // Create a canvas element to capture the image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      // Calculate the width and height for the selected aspect ratio
      const aspectRatio = this.selectedAspectRatio.split(':');
      const width = 640; // Fixed width for capturing image
      const height = (width * parseInt(aspectRatio[1])) / parseInt(aspectRatio[0]);

      canvas.width = width;
      canvas.height = height;

      // Draw the current video frame onto the canvas
      context.drawImage(this.videoElement, 0, 0, width, height);

      // Convert the canvas to base64 image data
      this.capturedImage = canvas.toDataURL('image/jpeg');
      console.log(this.capturedImage); // Use this image data as needed (e.g., save or display)
    } else {
      console.error('Canvas context is unavailable.');
    }
  }

  downloadImage() {
    // Create a link element to trigger the download of the captured image
    if (this.capturedImage) {
      const link = document.createElement('a');
      link.href = this.capturedImage;
      link.download = 'captured_image.jpg'; // Set the file name for the download
      link.click(); // Trigger the download
    }
  }
}
