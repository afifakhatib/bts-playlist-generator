import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @Output() createPlaylist = new EventEmitter<void>();
  // showCreator = false;

  // startCreating(){
  //   this.showCreator = true;
  //   console.log('Starting to create playlist...');

  //   // goHome(){
  //   //   this.showCreator = false;
  //   // }
  // }

  

}
