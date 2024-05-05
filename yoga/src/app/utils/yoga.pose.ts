import {NormalizedLandmark} from "@mediapipe/pose";
export class YogaPose {
  constructor(public name: string,
              public image: string,
              public info: string,
              public angles: { rightElbow: number, leftElbow: number, rightKnee: number, leftKnee: number, rightHip: number, leftHip: number }) {}
}
