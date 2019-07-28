import { Component, OnInit } from '@angular/core';
import { AdminDataService, AccountData } from '../admin-data.service';

@Component({
    selector: 'ccg-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  public cardCounts: Promise<any>;
  public userData: Promise<AccountData[]>;

    constructor(public admin: AdminDataService) {
        this.cardCounts = admin.getCardCounts();
        this.userData = admin.getUserData();
    }

    ngOnInit() {}
}
