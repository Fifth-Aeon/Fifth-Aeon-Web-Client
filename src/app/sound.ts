import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';
import { sample } from 'lodash';
import { Queue } from 'typescript-collections';
import { GameSyncEvent, SyncEventType } from './game_model/events/syncEvent';
import { ResourceType } from './game_model/resource';

export enum VolumeType {
    Master,
    Music,
    Effects,
    Narrator
}

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
    private voice: SpeechSynthesisVoice | undefined;
    private factionContext: Set<ResourceType> = new Set();

    //  Master, Music, Effects, Narrator
    private volume = [0.5, 0.5, 0.5, 0.5];
    private baseVolume = [2, 0.5, 2, 2];
    private musicTransitionTime = 1500;

    constructor() {
        this.addSound(
            'gong',
            new Howl({ src: ['assets/mp3/sfx/gong.mp3'] }),
            1.5
        );
        this.addSound('magic', new Howl({ src: ['assets/mp3/sfx/warp.mp3'] }));
        this.addSound(
            'attack',
            new Howl({ src: ['assets/mp3/sfx/attack.mp3'] })
        );
        this.addSound('bell', new Howl({ src: ['assets/mp3/sfx/bell.mp3'] }));
        this.addSound(
            'fanfare',
            new Howl({ src: ['assets/mp3/music/06-victory-cue.mp3'] })
        );
        this.addSound(
            'defeat',
            new Howl({ src: ['assets/mp3/music/05-defeat-cue.mp3'] })
        );

        this.music = new Howl({ src: ['assets/mp3/music/the-pyre.mp3'] });

        this.addMusic('bg-generic', this.music);
        this.addMusic(
            'bg-growth',
            new Howl({ src: ['assets/mp3/music/01-growth.mp3'] })
        );
        this.addMusic(
            'bg-renewal',
            new Howl({ src: ['assets/mp3/music/04-renewal.mp3'] })
        );
        this.addMusic(
            'bg-decay',
            new Howl({ src: ['assets/mp3/music/02-decay.mp3'] })
        );
        this.addMusic(
            'bg-synthesis',
            new Howl({ src: ['assets/mp3/music/03-synthesis.mp3'] })
        );

        this.loadSettings();

        speechSynthesis.onvoiceschanged = () => {
            const englishVoice = window.speechSynthesis
                .getVoices()
                .find(voice => voice.lang.includes('en'));
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
                if (event.turnNum !== 1) {
                    this.playSound('bell');
                }
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
        localStorage.setItem(
            SoundManager.localStorageKey,
            JSON.stringify({
                volume: this.volume,
                muted: this.muted
            } as SoundSettings)
        );
    }

    public loadSettings() {
        const settingData = localStorage.getItem(SoundManager.localStorageKey);
        if (settingData) {
            const savedSettings: SoundSettings = JSON.parse(settingData);
            this.muted = savedSettings.muted;
            this.volume = savedSettings.volume;
        }
        this.global.mute(this.muted);
    }

    public getVolumes() {
        return this.volume;
    }

    private getAdjustedVolume(type: VolumeType) {
        return (
            this.baseVolume[type] *
            this.volume[type] *
            this.volume[VolumeType.Master] *
            this.baseVolume[VolumeType.Master]
        );
    }

    public changeVolume(type: VolumeType, newVal: number) {
        this.volume[type] = newVal;
        this.saveSettings();
        if (type === VolumeType.Music || type === VolumeType.Master) {
            this.music.volume(this.getAdjustedVolume(VolumeType.Music));
        }
    }

    public speak(text: string) {
        if (!this.muted) {
            const msg = new SpeechSynthesisUtterance(text);
            this.music.volume(this.getAdjustedVolume(VolumeType.Music) / 4);
            msg.volume = this.getAdjustedVolume(VolumeType.Narrator);
            if (this.voice) {
                msg.voice = this.voice;
            }
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

    public musicIsPlaying() {
        return this.music.playing();
    }

    public toggleMute() {
        this.muted = !this.muted;
        this.global.mute(this.muted);
        if (this.muted) {
            speechSynthesis.cancel();
        }
        this.saveSettings();
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public setMusic(sound: Howl) {
        if (sound === this.music && this.music.playing()) {
            return;
        }
        if (this.music && this.music.playing()) {
            this.music.stop();
        }
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
        const all = Array.from(this.factionContext.keys()).map(
            factionName => `bg-${factionName.toLowerCase()}`
        );
        const trackName = sample(all) || 'bg-generic';
        const song = this.musicLibrary.get(trackName);
        if (!song) {
            throw new Error(`No song named ${trackName}`);
        }
        this.setMusic(song);
    }

    public addSound(name: string, sound: Howl, multiplier: number = 1) {
        this.library.set(name, sound);
    }

    public playSound(name: string) {
        const sound = this.library.get(name);
        if (!sound) {
            throw new Error(`No sound named ${name}.`);
        }
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        sound.play();
    }

    public playImportantSound(name: string): Promise<void> {
        const sound = this.library.get(name);
        if (!sound) {
            throw new Error(`No sound named ${name}.`);
        }
        sound.volume(this.getAdjustedVolume(VolumeType.Effects));
        this.music.volume(0);
        sound.play();

        return new Promise(resolve => {
            sound.once('end', () => {
                this.music.fade(
                    this.music.volume(),
                    this.getAdjustedVolume(VolumeType.Music),
                    this.musicTransitionTime
                );
                resolve();
            });
        });
    }

    public queueSound(name: string) {
        const sound = this.library.get(name);
        if (!sound) {
            throw new Error(`No sound named ${name}.`);
        }
        this.playQueue.enqueue(sound);

        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playNext();
        }
    }

    private playNext() {
        const sound = this.playQueue.dequeue();
        if (!sound) {
            return;
        }
        sound.play();
        sound.once('end', () => {
            setTimeout(() => {
                if (!this.playQueue.isEmpty()) {
                    this.playNext();
                } else {
                    this.isPlaying = false;
                    this.onDone.forEach(cb => cb());
                    this.onDone = [];
                }
            }, this.delay);
        });
    }
}
