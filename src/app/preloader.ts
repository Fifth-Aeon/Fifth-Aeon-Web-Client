import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Inject, Injectable, SecurityContext } from '@angular/core';
import { MdIconRegistry } from '@angular/material';

import { Card } from './game_model/card';
import { allCards } from './game_model/cards/allCards';
const cards = Array.from(allCards.values()).map(fact => fact());

const userInterfaceIcons = [
    'growth-small', 'synthesis-small', 'decay-small', 'renewal-small',
    'growth', 'synthesis', 'decay-icon', 'renewal',
    'card', 'hearts',
    'crossed-sabres','virtual-marker','shield', 'crosshair',
    'play1', 'block', 'play2', 'discard',
]

@Injectable()
export class Preloader {
    constructor(registry: MdIconRegistry, sanitizer: DomSanitizer) {
        let url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/tombstone.svg');
        registry.addSvgIconInNamespace('ccg', 'tombstone', url);
        url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/deck.svg');
        registry.addSvgIconInNamespace('ccg', 'deck', url);

        this.loadImages(userInterfaceIcons.map(img => 'assets/png/' + img + '.png'));
        setTimeout(() => this.loadImages(
            cards.map(card => 'assets/png/' + card.getImage())
        ), 1000);        
    }

    private loadImages(imageURLs:string[]) {
        for (let image of imageURLs) {
            let img = new Image();
            img.src = image;
        }
    }
}
