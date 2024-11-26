import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrected to 'styleUrls'
})
export class AppComponent implements OnInit, AfterViewInit {
  videoElement!: HTMLVideoElement;
  stream!: MediaStream;
  selectedAspectRatio: string = '4:3'; // Default aspect ratio

  ngOnInit() {
    // Setup the camera stream when component is initialized
    this.setupCamera();
  }

  ngAfterViewInit() {
    // DOM-dependent initialization can be done here
  }

  setupCamera() {
    // Camera constraints with ideal video resolutions
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 1280 }, // Ideal width
        height: { ideal: 720 }  // Ideal height
      }
    };

    // Access the user's camera
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoElement = document.querySelector('video')!;
        this.videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing the camera: ', error);
      });
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
      const imageData = canvas.toDataURL('image/jpeg');
      console.log(imageData); // Use this image data as needed (e.g., save or display)
    } else {
      console.error('Canvas context is unavailable.');
    }
  }

  changeAspectRatio(ratio: string) {
    // Update the selected aspect ratio when the user selects a new option
    this.selectedAspectRatio = ratio;
  }
}
