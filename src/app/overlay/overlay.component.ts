import { Component, OnInit } from '@angular/core';
import { OverlayService } from '../overlay.service';

@Component({
  selector: 'ccg-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  constructor(
    public overlay: OverlayService
  ) { }

  public overlayCardPos(index: number) {
    return {
      left: 15 + (index * 10) + '%'
    };
  }

  ngOnInit() {
  }

}
