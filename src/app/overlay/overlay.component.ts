import { Component, OnInit } from '@angular/core';
import { OverlayService } from '../overlay.service';
import { Animator, BattleAnimationEvent } from '../game_model/animator';

@Component({
  selector: 'ccg-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  constructor(
    public overlay: OverlayService
  ) {  }

  public overlayCardPos(index: number) {
    return {
      left: 15 + (index * 10) + '%'
    };
  }

  public defenderPos(index: number) {
    return {
      left: 15 + (index * 10) + '%'
    };
  }

  public getOverlayStyle() {
    return {
      'background-color': this.overlay.getAnimator().isAnimiating() ? 'rgba(0, 0, 0, 0.8)' : 'transparent'
    };
  }

  ngOnInit() {
  }

}
