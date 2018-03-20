import { Queue } from 'typescript-collections';
import { Howler, Howl } from 'howler';
import { Injectable } from '@angular/core';


export enum VolumeType { Master, Music, Effects, Narrator }

interface SoundSettings {
    volume: [number, number, number, number];
    muted: boolean;
}

@Injectable()
export class SoundManager {
    private static localStorageKey = 'sound-settings';

    private global = Howler;
    private playQueue: Queue<Howl> = new Queue<Howl>();
    private library: Map<string, Howl> = new Map<string, Howl>();
    private isPlaying = false;
    private delay = 100;
    private music: Howl;
    public muted = false;
    private onDone: Array<() => void> = [];
    private voice: SpeechSynthesisVoice;

    //  Master, Music, Effects, Narrator
    private volume = [0.5, 0.5, 0.5, 0.5];
    private baseVolume = [2, 0.15, 2, 2];

    constructor() {
        this.addSound('gong', new Howl({ src: ['assets/mp3/gong.mp3'] }), 1.5);
        this.addSound('magic', new Howl({ src: ['assets/mp3/warp.mp3'] }));
        this.addSound('attack', new Howl({ src: ['assets/mp3/attack.mp3'] }));
        this.addSound('bell', new Howl({ src: ['assets/mp3/bell.mp3'] }));
        this.setMusic(new Howl({
            src: ['assets/mp3/crunk-knight.mp3'],
        }));
        this.addSound('fanfare', new Howl({ src: ['assets/mp3/fanfare.mp3'] }));
        this.addSound('defeat', new Howl({ src: ['assets/mp3/sad-part.mp3'] }));

        this.loadSettings();

        speechSynthesis.onvoiceschanged = () => {
            let englishVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.includes('en'));
            if (englishVoice) {
                this.voice = englishVoice;
            } else {
                console.warn('Warning no english voice detected.');
            }
        };
    }

    public saveSettings() {
        localStorage.setItem(SoundManager.localStorageKey, JSON.stringify({
            volume: this.volume,
            muted: this.muted
        } as SoundSettings));
    }

    public loadSettings() {
        let settingData = localStorage.getItem(SoundManager.localStorageKey);
        if (settingData) {
            let savedSettings: SoundSettings = JSON.parse(settingData);
            this.muted = savedSettings.muted;
            this.volume = savedSettings.volume;
        }
        this.global.mute(this.muted);
    }

    public getVolumes() {
        return this.volume;
    }

    private getAdjustedVolume(type: VolumeType) {
        return this.baseVolume[type] * this.volume[type] * this.volume[VolumeType.Master] * this.baseVolume[VolumeType.Master];
    }


    public changeVolume(type: VolumeType, newVal: number) {
        this.volume[type] = newVal;
        this.saveSettings();
        if (type === VolumeType.Music || type === VolumeType.Master)
            this.music.volume(this.getAdjustedVolume(VolumeType.Music));
    }

    public speak(text: string) {
        if (!this.muted) {
            let msg = new SpeechSynthesisUtterance(text);
            this.music.volume(this.getAdjustedVolume(VolumeType.Music) / 4);
            msg.volume = this.getAdjustedVolume(VolumeType.Narrator);
            if (this.voice)
                msg.voice = this.voice;
            speechSynthesis.speak(msg);
            msg.onend = () => {
                this.music.volume(this.getAdjustedVolume(VolumeType.Music));
            };
        }
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
        this.saveSettings();
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public setMusic(sound: Howl) {
        this.music = sound;
        this.music.once('load', () => {
            this.music.loop(true);
            this.music.play();
            this.music.volume(this.getAdjustedVolume(VolumeType.Music));
        });
    }

    public addSound(name: string, sound: Howl, multiplier: number = 1) {
        this.library.set(name, sound);
    }

    public playSound(name: string) {
        let sound = this.library.get(name);
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        sound.play();
    }

    public playImportantSound(name: string) {
        let sound = this.library.get(name);
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        let time = 8000;
        sound.once('end', () => {
            this.music.fade(0, this.getAdjustedVolume(VolumeType.Music), time);
        });
        this.music.volume(0);
        sound.play();
    }

    public queueSound(name: string) {
        let sound = this.library.get(name);
        this.playQueue.enqueue(sound);

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
