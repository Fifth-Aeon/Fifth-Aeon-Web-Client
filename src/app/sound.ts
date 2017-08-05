import { Queue } from 'typescript-collections';
import { Howler, Howl } from 'howler';
import { Injectable } from '@angular/core';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';


const localStorageMuteKey = 'sound-is-muted';


@Injectable()
export class SoundManager {
    private global = Howler;
    private playQueue: Queue<Howl> = new Queue<Howl>();
    private library: Map<string, Howl> = new Map<string, Howl>();
    private isPlaying: boolean = false;
    private delay: number = 100;
    private music: Howl;
    private muted: boolean = false;
    private onDone: Array<() => void> = [];

    constructor(hotkeys: HotkeysService) {
        this.addSound('gong', new Howl({ src: ['assets/mp3/gong.mp3'], volume: 1.5 }));
        this.addSound('magic', new Howl({ src: ['assets/mp3/warp.mp3'] }));
        this.addSound('attack', new Howl({ src: ['assets/mp3/attack.mp3'] }));
        this.setMusic(new Howl({
            src: ['assets/mp3/crunk-knight.mp3'],
            volume: 0.1
        }));
        this.muted = (localStorage.getItem(localStorageMuteKey) || 'false') == 'true';
        this.global.mute(this.muted);

        hotkeys.add(new Hotkey('m', (event: KeyboardEvent): boolean => {
            this.toggleMute();
            return false; // Prevent bubbling
        }, [], 'Mute/Unmute'));

    }
    public doWhenDonePlaying(callback: () => void) {
        if (this.muted || !this.isPlaying) {
            callback();
        } else {
            this.onDone.push(callback);
        }
    }

    public toggleMute() {
        this.muted = !this.muted;
        this.global.mute(this.muted);
        localStorage.setItem(localStorageMuteKey, this.muted.toString());
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public setMusic(sound: Howl) {
        this.music = sound;
        this.music.load();
        this.music.once("load", () => {
            this.music.loop(true);
            this.music.play();
        })
    }

    public addSound(name: string, sound: Howl) {
        this.library.set(name, sound);
    }

    public playSound(name: string) {
        let sound = this.library.get(name).play();
    }

    public queueSound(name: string) {
        let sound = this.library.get(name);
        this.playQueue.enqueue(sound)

        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playNext();
        }
    }

    private playNext() {
        let sound = this.playQueue.dequeue();
        sound.play();
        sound.once('end', () => {
            setTimeout(() => {
                if (!this.playQueue.isEmpty())
                    this.playNext();
                else {
                    this.isPlaying = false;
                    this.onDone.forEach(cb => cb());
                    this.onDone = [];
                }
            }, this.delay);
        });
    }
}
