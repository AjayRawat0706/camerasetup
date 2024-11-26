import { FormsModule } from '@angular/forms';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  selectedAspectRatio = '16:9';
  videoWidth: number = 640;
  videoHeight: number = 480;
  constraints: MediaStreamConstraints = {};

  ngOnInit(): void {
    this.updateAspectRatio();
  }

  ngAfterViewInit(): void {
    this.startCamera();  // Start the camera after the view is initialized
  }

  updateAspectRatio() {
    if (this.selectedAspectRatio === '4:3') {
      this.constraints = { video: { aspectRatio: 4 / 3 } };
    } else if (this.selectedAspectRatio === '16:9') {
      this.constraints = { video: { aspectRatio: 16 / 9 } };
    } else if (this.selectedAspectRatio === '1:1') {
      this.constraints = { video: { aspectRatio: 1 } };
    }
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then((stream) => {
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        videoElement.srcObject = stream;
      })
      .catch((err) => {
        console.error('Error accessing camera: ', err);
      });
  }

  captureImage() {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    const aspectRatio = this.selectedAspectRatio.split(':');
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    let cropWidth: number = 0;
    let cropHeight: number = 0;

    // Ensure cropWidth and cropHeight are always assigned values
    if (aspectRatio[0] === '4' && aspectRatio[1] === '3') {
      cropWidth = width;
      cropHeight = (width * 3) / 4;
    } else if (aspectRatio[0] === '16' && aspectRatio[1] === '9') {
      cropWidth = width;
      cropHeight = (width * 9) / 16;
    } else if (aspectRatio[0] === '1' && aspectRatio[1] === '1') {
      cropWidth = Math.min(width, height);
      cropHeight = cropWidth;
    } else {
      // Fallback if no matching aspect ratio
      cropWidth = width;
      cropHeight = height;
    }

    // Draw the cropped image to the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      videoElement,
      (width - cropWidth) / 2,
      (height - cropHeight) / 2,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  downloadImage() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'captured-image.png';
    link.click();
  }
}
