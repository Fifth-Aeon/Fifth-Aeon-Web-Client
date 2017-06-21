import { Queue } from 'typescript-collections';
import { Howler, Howl } from 'howler';
import { Injectable } from '@angular/core';

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

    constructor() {
        this.addSound('splash', new Howl({ src: ['assets/splash.mp3'] }));
        this.addSound('shot', new Howl({ src: ['assets/shot.mp3'] }));
        this.addSound('explosion', new Howl({ src: ['assets/explosion.mp3'] }));
        this.setMusic(new Howl({
            src: ['assets/bgmusic.mp3'],
            volume: 0.0
        }));
        this.muted = (localStorage.getItem(localStorageMuteKey) || 'false') == 'true';
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
