import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { sortBy } from 'lodash';
import { cardList } from './game_model/cards/cardList';

const userInterfaceIcons = [
    'growth-small',
    'synthesis-small',
    'decay-small',
    'renewal-small',
    'growth',
    'synthesis',
    'decay-icon',
    'renewal',
    'card',
    'hearts',
    'crossed-sabres',
    'virtual-marker',
    'shield',
    'crosshair',
    'play1',
    'block',
    'play2',
    'discard'
];

@Injectable()
export class Preloader {
    constructor(registry: MatIconRegistry, sanitizer: DomSanitizer) {
        const url = sanitizer.bypassSecurityTrustResourceUrl(
            'assets/svg/tombstone.svg'
        );
        registry.addSvgIconInNamespace('ccg', 'tombstone', url);
        const url2 = sanitizer.bypassSecurityTrustResourceUrl(
            'assets/svg/deck.svg'
        );
        registry.addSvgIconInNamespace('ccg', 'deck', url2);
    }

    public preload() {
        this.loadImages(
            userInterfaceIcons.map(img => 'assets/png/' + img + '.png')
        );
        setTimeout(
            () =>
                this.loadImages(
                    sortBy(
                        cardList.getCards(),
                        card => -card.getCardType()
                    ).map(card => 'assets/png/' + card.getImage())
                ),
            1000
        );
    }

    private loadImages(imageURLs: string[]) {
        for (const image of imageURLs) {
            const img = new Image();
            img.src = image;
        }
    }
}
