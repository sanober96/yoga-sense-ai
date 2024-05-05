import { Routes } from '@angular/router';
import {PoseDetectorComponent} from "./pose.detector/pose.detector.component";
import {HomeComponent} from "./home/home.component";

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'pose', component: PoseDetectorComponent}
];
