import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {YogaPose} from "./utils/yoga.pose";
import {YogaPosesResponse} from "./utils/yoga.poses.response";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _poses: YogaPose[] = [];
  private _isYogaActivated: boolean = false;
  private posesURL: string = 'assets/poses/poses.json';

  constructor(private _http: HttpClient) {

  }

  get isYogaActivated(): boolean {
    return this._isYogaActivated;
  }

  set isYogaActivated(value: boolean) {
    this._isYogaActivated = value;
  }

  getYogaPoses(): Observable<YogaPosesResponse>{
    return this._http.get<YogaPosesResponse>(this.posesURL);
  }

  public getColor(value: number=0): string{
    if (!this._isYogaActivated){
      return "#42d2ee";
    }

    if (value < 0) {
      value = 0;
    }

    if (value > 1){
      value = 1;
    }

    // Calculate the r and g components based on the normalized value.
    const r = Math.round(255 * (1 - value));
    const g = Math.round(255 * value);
    const b = 0; // No b component needed for r to g transition

    // Convert RGB to Hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  public darkenColor(hexColor: string, value: number= 0.7): string {
    if (value < 0 || value > 100) {
      throw new Error('Darken percentage must be between 0 and 100');
    }

    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);


    // Apply the darken percentage
    r = Math.floor(r * value);
    g = Math.floor(g * value);
    b = Math.floor(b * value);

    // Convert RGB back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

  }



}
