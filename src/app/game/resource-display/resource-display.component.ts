import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../../game_model/resource';

@Component({
    selector: 'ccg-resource-display',
    templateUrl: './resource-display.component.html',
    styleUrls: ['./resource-display.component.scss']
})
export class ResourceDisplayComponent implements OnInit {
    @Input() resource: Resource;

    iconSize = 28;
    padding = 15;
    resourceTypes = [
        { name: 'Growth', icon: 'assets/png/growth.png', color: '#417505' },
        {
            name: 'Synthesis',
            icon: 'assets/png/synthesis.png',
            color: '#c9c9c9'
        },
        { name: 'Decay', icon: 'assets/png/decay-icon.png', color: '#370661' },
        { name: 'Renewal', icon: 'assets/png/renewal.png', color: '#f8e71c' }
    ];

    constructor() {}

    ngOnInit() {}
}
