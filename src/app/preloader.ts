import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Inject, Injectable, SecurityContext } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { sortBy } from 'lodash';

import { Card } from './game_model/card';
import { cardList } from './game_model/cards/cardList';

const userInterfaceIcons = [
    'growth-small', 'synthesis-small', 'decay-small', 'renewal-small',
    'growth', 'synthesis', 'decay-icon', 'renewal',
    'card', 'hearts',
    'crossed-sabres', 'virtual-marker', 'shield', 'crosshair',
    'play1', 'block', 'play2', 'discard',
];

@Injectable()
export class Preloader {
    constructor(registry: MatIconRegistry, sanitizer: DomSanitizer) {
        let url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/tombstone.svg');
        registry.addSvgIconInNamespace('ccg', 'tombstone', url);
        url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/deck.svg');
        registry.addSvgIconInNamespace('ccg', 'deck', url);
    }

    public preload() {
        this.loadImages(userInterfaceIcons.map(img => 'assets/png/' + img + '.png'));
        setTimeout(() => this.loadImages(
            sortBy(cardList.getCards(), (card) => -card.getCardType()).map(card => 'assets/png/' + card.getImage())
        ), 1000);
    }

    private loadImages(imageURLs: string[]) {
        for (let image of imageURLs) {
            let img = new Image();
            img.src = image;
        }
    }
}
