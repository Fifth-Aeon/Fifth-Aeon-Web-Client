import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Inject, Injectable, SecurityContext } from '@angular/core';
import { MdIconRegistry } from '@angular/material';



const images = [
    //"assets/svg/tombstone.svg"
]

@Injectable()
export class Preloader { 
    constructor(registry: MdIconRegistry, sanitizer: DomSanitizer) {
        let url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/tombstone.svg');
        registry.addSvgIconInNamespace('ccg', 'tombstone', url);
        url = sanitizer.bypassSecurityTrustResourceUrl('assets/svg/deck.svg');
        registry.addSvgIconInNamespace('ccg', 'deck', url);
        for (let image of images) {
            let img = new Image();
            img.src = image;
        }
    }
}
