import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {Camera} from "@mediapipe/camera_utils";
import {
  LandmarkConnectionArray,
  NormalizedLandmark,
  NormalizedLandmarkList,
  Pose,
  POSE_CONNECTIONS
} from "@mediapipe/pose";
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";
import {YogaPoseComponent} from "../yoga.pose/yoga.pose.component";
import {HeaderComponent} from "../header/header.component";
import {DataService} from "../data.service";
import {YogaPose} from "../utils/yoga.pose";
import {NgIf} from "@angular/common";
import {animate, group, query, state, style, transition, trigger} from "@angular/animations";

enum YOGA_POSE_JOINTS{
  RIGHT_ELBOW,
  LEFT_ELBOW,
  RIGHT_KNEE,
  LEFT_KNEE,
  RIGHT_HIP,
  LEFT_HIP
}
@Component({
  selector: 'app-pose.detector',
  standalone: true,
  imports: [
    YogaPoseComponent,
    HeaderComponent,
    NgIf
  ],
  templateUrl: './pose.detector.component.html',
  styleUrl: './pose.detector.component.css',
})
export class PoseDetectorComponent implements AfterViewInit, OnDestroy{

  name: string = "";
  info: string = "";
  index: number = 0;
  yogaPoses!: YogaPose[];
  private yogaPoseJoints: YOGA_POSE_JOINTS[] = [YOGA_POSE_JOINTS.RIGHT_ELBOW,
    YOGA_POSE_JOINTS.LEFT_ELBOW,
    YOGA_POSE_JOINTS.RIGHT_KNEE,
    YOGA_POSE_JOINTS.LEFT_KNEE,
    YOGA_POSE_JOINTS.RIGHT_HIP,
    YOGA_POSE_JOINTS.LEFT_HIP
  ]

  private camera: Camera | undefined;
  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('webcamContainer') webcamContainer: ElementRef<HTMLCanvasElement> | undefined;

  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    if (this.webcamContainer?.nativeElement && this.canvasElement?.nativeElement && this.videoElement?.nativeElement){
      this.videoElement.nativeElement.width = this.webcamContainer.nativeElement.clientWidth;
      this.videoElement.nativeElement.height = this.webcamContainer.nativeElement.clientHeight;
      this.canvasElement.nativeElement.width = this.webcamContainer.nativeElement.clientWidth;
      this.canvasElement.nativeElement.height = this.webcamContainer.nativeElement.clientHeight;
    }
  }

  HIDE_POSE: number[] = [0,1,2,3,4,5,6,7,8,9,10,17,18,19,20,21,22,30,31]

  constructor(private _dataService: DataService) {
  }
  ngAfterViewInit(): void {
    const videoElement = this.videoElement?.nativeElement;
    const canvasElement = this.canvasElement?.nativeElement;
    const webcamContainer = this.webcamContainer?.nativeElement;
    const context = canvasElement?.getContext('2d');

    if (webcamContainer && canvasElement){
      canvasElement.width = webcamContainer.clientWidth;
      canvasElement.height = webcamContainer.clientHeight;
    }

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const connections:LandmarkConnectionArray = Array([11,12], [23,24]);

    pose.onResults((results) => {
      if (canvasElement && videoElement && context) {
        context.save();
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        context.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        const landmarks = results.poseLandmarks;

        if (!landmarks){
          context.restore();
          return;
        }

        for (let yogaPoseJoint of this.yogaPoseJoints){
          this._checkPose(yogaPoseJoint, landmarks, context);
        }

        // draw remaining joints & connections
        const color = this._dataService.getColor(1);
        drawConnectors(context, landmarks, connections, {color: color, lineWidth: 10});
        context.restore();
      }
    });

    if (videoElement) {
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          await pose.send({image: videoElement});
        },
        width: canvasElement?.width,
        height: canvasElement?.height
      });
      this.camera?.start();
    }


    this._subscribeYogaPoses();
  }

  onStop(): void{
    this.camera?.stop();
  }

  ngOnDestroy(): void {
    this.camera?.stop();
  }

  onStart() {
    this.camera?.start();
  }

  _calculateAngle(p1: NormalizedLandmark,p2: NormalizedLandmark,p3: NormalizedLandmark): number{
    const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    const b = Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2);
    const c = Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2);
    const angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b));
    return angle * (180 / Math.PI);
  }


  private _subscribeYogaPoses() {
    this._dataService.getYogaPoses().subscribe(
      data => {
        this.yogaPoses = data.poses;
        this.name = this.yogaPoses[0].name;
        this.info = this.yogaPoses[0].info;
        this.index = 0;
      });
  }

  showPreviousYogaPose() {
    if (this.index > 0) {
      this.index--;
    }
  }
  showNextYogaPose() {
    if (this.index < this.yogaPoses.length - 1) {
      this.index++;
    }
  }

  _checkPose(joint:YOGA_POSE_JOINTS, landmarks: NormalizedLandmarkList, context: CanvasRenderingContext2D){
    if (!this.yogaPoses) return;
    const currentPose = this.yogaPoses[this.index];
    let joints!: number[];
    let jointsLandmarks!: NormalizedLandmark[];
    let connections!: LandmarkConnectionArray;
    let targetAngle!: number;
    switch (joint){
      case YOGA_POSE_JOINTS.RIGHT_ELBOW:
        joints = [12,14,16];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([12,14], [14,16]);
        targetAngle = currentPose.angles.rightElbow;
        break;
      case YOGA_POSE_JOINTS.LEFT_ELBOW:
        joints = [11,13,15];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([11,13], [13,15]);
        targetAngle = currentPose.angles.leftElbow;
        break;
      case YOGA_POSE_JOINTS.RIGHT_KNEE:
        joints = [24,26,28];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([24,26], [26,28]);
        targetAngle = currentPose.angles.rightKnee;
        break;
      case YOGA_POSE_JOINTS.LEFT_KNEE:
        joints = [23,25,27];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([23,25], [25,27]);
        targetAngle = currentPose.angles.leftKnee;
        //console.log(this._calculateAngle(jointsLandmarks[0], jointsLandmarks[1], jointsLandmarks[2]));
        break;
      case YOGA_POSE_JOINTS.RIGHT_HIP:
        joints = [12,24,26];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([12,24]);
        targetAngle = currentPose.angles.rightHip;
        break
      case YOGA_POSE_JOINTS.LEFT_HIP:
        joints = [11,23,25];
        jointsLandmarks = [landmarks[joints[0]], landmarks[joints[1]], landmarks[joints[2]]];
        connections = Array([11,23]);
        targetAngle = currentPose.angles.leftHip;
        break;
      }
    this._calculateAndDraw(landmarks, jointsLandmarks, connections, context, targetAngle);
  }

  _calculateAndDraw(landmarks: NormalizedLandmarkList,
                    jointLandmarks: NormalizedLandmark[],
                    connectionsArray: LandmarkConnectionArray,
                    context: CanvasRenderingContext2D,
                    targetAngle: number){
    const angle = this._calculateAngle(jointLandmarks[0], jointLandmarks[1], jointLandmarks[2]);
    const correctness = (1-Math.abs(targetAngle-angle)/targetAngle);
    const color = this._dataService.getColor(correctness);
    drawConnectors(context, landmarks, connectionsArray, {color: color, lineWidth: 10});
    drawLandmarks(context, jointLandmarks, {color: this._dataService.darkenColor(color), lineWidth: 2});
  }

}
