import { Component, OnInit } from '@angular/core';
import { OverlayService } from '../overlay.service';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'ccg-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  animations: [
    trigger('txtState', [
      state('void', style({ opacity: 1 })),
      transition(':enter', [
        animate('3.0s ease', style({
          opacity: 0,
          transform: 'translateY(-60px)'
        }))
      ])
    ])
  ]
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
      'background-color': this.overlay.getAnimator().isAnimating() ? 'rgba(0, 0, 0, 0.8)' : 'transparent'
    };
  }

  ngOnInit() {
  }

}
