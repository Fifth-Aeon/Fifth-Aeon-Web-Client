import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { GameManager } from '../../gameManager';

@Component({
    selector: 'ccg-resource-selector',
    templateUrl: './resource-selector.component.html',
    styleUrls: ['./resource-selector.component.css']
})
export class ResourceSelectorComponent implements OnInit, OnDestroy {
    @Input() canPlayResource = false;

    private hotkeys: Array<Hotkey> = [];

    private makeHotkey(key: string, resource: string) {
        return new Hotkey(
            key,
            (event: KeyboardEvent): boolean => {
                this.playResource(resource);
                return false;
            },
            [],
            'Play ' + resource + ' resource.'
        );
    }

    constructor(
        private gameManager: GameManager,
        private hotkeyService: HotkeysService
    ) {}

    public disableTip() {
        if (!this.canPlayResource) {
            return 'You can\'t play a resource right now.';
        }
    }

    public tip(msg: string) {
        if (!this.canPlayResource) {
            return '';
        }
        return msg;
    }

    playResource(type: string) {
        const game = this.gameManager.getGame();
        if (!this.canPlayResource || !game) {
            return;
        }
        game.playResource(type);
    }

    ngOnInit() {
        const resources = ['Growth', 'Synthesis', 'Decay', 'Renewal'];
        const keys = ['g', 's', 'd', 'r'];
        for (let i = 0; i < 4; i++) {
            const hotkey = this.makeHotkey(keys[i], resources[i]);
            this.hotkeys.push(hotkey);
            this.hotkeyService.add(hotkey);
        }
    }

    ngOnDestroy() {
        for (const hotkey of this.hotkeys) {
            this.hotkeyService.remove(hotkey);
        }
    }
}
