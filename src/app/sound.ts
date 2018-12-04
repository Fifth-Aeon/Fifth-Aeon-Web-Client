import { Queue } from 'typescript-collections';
import { Howler, Howl } from 'howler';
import { Injectable } from '@angular/core';
import { SyncEventType, GameSyncEvent } from './game_model/game';
import { ResourceType } from './game_model/resource';
import { sample } from 'lodash';


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
    private musicLibrary: Map<string, Howl> = new Map<string, Howl>();

    private isPlaying = false;
    private delay = 100;
    private music: Howl;
    public muted = false;
    private onDone: Array<() => void> = [];
    private voice: SpeechSynthesisVoice;
    private factionContext: Set<ResourceType> = new Set();

    //  Master, Music, Effects, Narrator
    private volume = [0.5, 0.5, 0.5, 0.5];
    private baseVolume = [2, 0.5, 2, 2];
    private musicTransitionTime = 1500;

    constructor() {
        this.addSound('gong', new Howl({ src: ['assets/mp3/gong.mp3'] }), 1.5);
        this.addSound('magic', new Howl({ src: ['assets/mp3/warp.mp3'] }));
        this.addSound('attack', new Howl({ src: ['assets/mp3/attack.mp3'] }));
        this.addSound('bell', new Howl({ src: ['assets/mp3/bell.mp3'] }));
        this.addSound('fanfare', new Howl({ src: ['assets/mp3/fanfare.mp3'] }));
        this.addSound('defeat', new Howl({ src: ['assets/mp3/sad-part.mp3'] }));

        this.addMusic('bg-generic', new Howl({ src: ['assets/mp3/the-pyre.mp3'] }));
        this.addMusic('bg-growth', new Howl({ src: ['assets/mp3/kalimba_draft_1.mp3'] }));
        this.addMusic('bg-renewal', new Howl({ src: ['assets/mp3/healing_draft_1.mp3'] }));
        this.addMusic('bg-decay', new Howl({ src: ['assets/mp3/decay_sketch_2_draft_1.mp3'] }));
        this.addMusic('bg-synthesis', new Howl({ src: ['assets/mp3/synthesis_idea.mp3'] }));

        this.setMusic(this.musicLibrary.get('bg-generic'));

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

    private addMusic(name: string, howl: Howl) {
        howl.once('end', () => this.onMusicEnd());
        howl.loop(true);
        this.musicLibrary.set(name, howl);
    }

    public setFactionContext(context: Set<ResourceType>) {
        if (context) {
            this.factionContext = context;
            this.endMusic();
        }
    }

    public handleGameEvent(event: GameSyncEvent) {
        switch (event.type) {
            case SyncEventType.TurnStart:
                if (event.params.turnNum !== 1)
                    this.playSound('bell');
                break;
            case SyncEventType.AttackToggled:
            case SyncEventType.Block:
                this.playSound('attack');
                break;
            case SyncEventType.PlayCard:
            case SyncEventType.EnchantmentModified:
                this.playSound('magic');
                break;
        }

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
        if (this.muted)
            speechSynthesis.cancel();
        this.saveSettings();
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public setMusic(sound: Howl) {
        if (sound === this.music)
            return;
        if (this.music && this.music.playing())
            this.music.stop();
        this.music = sound;
        this.music.play();
        this.music.volume(this.getAdjustedVolume(VolumeType.Music));
    }

    private endMusic() {
        this.music.fade(this.music.volume(), 0, this.musicTransitionTime);
        setTimeout(() => {
            this.onMusicEnd();
        }, this.musicTransitionTime);
    }

    private onMusicEnd() {
        let all = Array.from(this.factionContext.keys()).map(factionName => `bg-${factionName.toLowerCase()}`);
        if (all.length === 0)
            all.push('bg-generic');
        let trackName = sample(all);
        this.setMusic(this.musicLibrary.get(trackName));
    }

    public addSound(name: string, sound: Howl, multiplier: number = 1) {
        this.library.set(name, sound);
    }

    public playSound(name: string) {
        let sound = this.library.get(name);
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        sound.play();
    }

    public playImportantSound(name: string): Promise<void> {
        let sound = this.library.get(name);
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        this.music.volume(0);
        sound.play();

        return new Promise(resolve => {
            sound.once('end', () => {
                this.music.fade(this.music.volume(), this.getAdjustedVolume(VolumeType.Music), this.musicTransitionTime);
                resolve();
            });
        });
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
