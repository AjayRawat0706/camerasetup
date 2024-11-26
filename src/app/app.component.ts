import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrected to 'styleUrls'
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild("video") public video!: ElementRef<HTMLVideoElement>;  // Added '!' (non-null assertion)
  @ViewChild("canvas") public canvas!: ElementRef<HTMLCanvasElement>;  // Added '!' (non-null assertion)

  public captures: string[];  // Specify the type of the array

  public constructor() {
    this.captures = [];
  }

  public ngOnInit(): void { }

  public ngAfterViewInit(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.video.nativeElement.srcObject = stream;  // Use srcObject instead of createObjectURL
        this.video.nativeElement.play();
      }).catch((err) => {
        console.error('Error accessing webcam: ', err);
      });
    }
  }

  public capture(): void {
    const context = this.canvas.nativeElement.getContext("2d");
    if (context) {
      context.drawImage(this.video.nativeElement, 0, 0, 600, 400);
      this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
    }
  }
}
