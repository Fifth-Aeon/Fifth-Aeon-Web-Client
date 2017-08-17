import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Inject, Injectable, SecurityContext } from '@angular/core';
import { MdIconRegistry } from '@angular/material';

import { Card } from './game_model/card';
import { allCards } from './game_model/cards/allCards';
const cards = Array.from(allCards.values()).map(fact => fact());



@Injectable()
export class Preloader {
    constructor(registry: MdIconRegistry, sanitizer: DomSanitizer) {
        let url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/tombstone.svg');
        registry.addSvgIconInNamespace('ccg', 'tombstone', url);
        url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/deck.svg');
        registry.addSvgIconInNamespace('ccg', 'deck', url);

        let images = cards.map(card => 'assets/png/' + card.getImage());
        for (let image of images) {
            let img = new Image();
            img.src = image;
        }
    }
}
