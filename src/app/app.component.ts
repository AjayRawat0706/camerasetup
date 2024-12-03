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
          video: { facingMode: 'environment' } // Use the back camera
        });
  
        this.videoElement.nativeElement.srcObject = stream;
  
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.adjustVideoAspectRatio();
        };
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
  
    // Adjust video to fit the specified aspect ratio (e.g., 4:3)
    adjustVideoAspectRatio() {
      const video = this.videoElement.nativeElement;
      const aspectRatio = 4 / 3;  // Desired aspect ratio
  
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
  
      // Calculate the desired width and height based on the aspect ratio
      let width = videoWidth;
      let height = videoWidth / aspectRatio;
  
      if (height > videoHeight) {
        height = videoHeight;
        width = videoHeight * aspectRatio;
      }
  
      // Set the video display size with the calculated dimensions
      video.width = width;
      video.height = height;
  
      // Center the video in the container
      const offsetX = (videoWidth - width) / 2;
      const offsetY = (videoHeight - height) / 2;
  
      video.style.objectPosition = `-${offsetX}px -${offsetY}px`; // To ensure it's centered
    }
  
    // Capture image while maintaining the aspect ratio
    captureImage() {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const ctx = canvas.getContext('2d');
  
      // Get the visible size of the video element
      const videoWidth = video.width;
      const videoHeight = video.height;
  
      // Set the canvas size to match the visible area of the video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
  
      // Calculate the visible region (taking into account object-fit: cover and centering)
      const videoRect = video.getBoundingClientRect();
      const scaleX = videoWidth / videoRect.width;
      const scaleY = videoHeight / videoRect.height;
  
      // Ensure the correct visible region is captured
      ctx?.drawImage(
        video,
        videoRect.left * scaleX, videoRect.top * scaleY, 
        videoRect.width * scaleX, videoRect.height * scaleY,
        0, 0, canvas.width, canvas.height
      );
  
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
  

