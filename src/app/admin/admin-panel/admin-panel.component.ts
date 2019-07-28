import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminDataService, AccountData } from '../admin-data.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'ccg-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
    public cardCounts: Promise<any>;
    public userData: Promise<AccountData[]>;
    public userInfo: AccountData[] = [];
    public displayedColumns: string[] = [
        'username',
        'lastActive',
        'joined',
        'role'
    ];
    dataSource: MatTableDataSource<AccountData>;

    @ViewChild(MatSort, { static: true })
    sort!: MatSort;

    constructor(public admin: AdminDataService) {
        this.cardCounts = admin.getCardCounts();
        this.userData = admin.getUserData();
        this.dataSource = new MatTableDataSource<AccountData>([]);

        this.userData.then(data => {
            this.dataSource.data = data;
        });
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
    }
}
