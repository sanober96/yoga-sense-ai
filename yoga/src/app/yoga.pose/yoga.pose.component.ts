import {AfterViewInit, Component, Input} from '@angular/core';
import {DataService} from "../data.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-yoga-pose',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './yoga.pose.component.html',
  styleUrl: './yoga.pose.component.css',


})
export class YogaPoseComponent implements AfterViewInit{

  @Input() name!: string;
  @Input() info!: string;
  @Input() image : string = "https://firebasestorage.googleapis.com/v0/b/yoga-sense-ai.appspot.com/o/poses%2Fimages%2Fgoddess_pose.svg?alt=media&token=a6a6522e-e49c-4404-9ce4-147c85b54dd2";

  isActive: boolean = false;
  activeStates: boolean[] = [false, false, false];
  constructor(private _dataService: DataService) {
    this.isActive = false;
    this._dataService.isYogaActivated = this.isActive;
  }

  ngAfterViewInit(): void {
  }

  activate() {
    this._dataService.isYogaActivated = true;
    this.isActive = true;
    this.activeStates[0] = true;
  }

  toggleActive(index: number): void {
    this.activeStates = this.activeStates.map((_, i) => i === index);
  }

  reset() {
    this._dataService.isYogaActivated = false;
    this.isActive = false;
    this.activeStates = [false, false, false];
  }
}
