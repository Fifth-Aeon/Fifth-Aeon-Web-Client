import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Inject, Injectable, SecurityContext } from '@angular/core';

const images = [
    //"assets/svg/tombstone.svg"
]

@Injectable()
export class Preloader {
    constructor( ) {       
        for (let image of images) {
            let img = new Image();
            img.src = image;
        }
    }
}
