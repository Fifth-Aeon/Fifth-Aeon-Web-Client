import { Queue } from 'typescript-collections';
import { Howler, Howl } from 'howler';

export class SoundManager {
    private playQueue: Queue<Howl> = new Queue<Howl>();
    private library: Map<string, Howl> = new Map<string, Howl>();
    private isPlaying: boolean = false;
    private delay: number = 100;
    private music: Howl;

    constructor() {
        this.addSound('splash', new Howl({ src: ['assets/splash.mp3'] }));
        this.addSound('shot', new Howl({ src: ['assets/shot.mp3'] }));
        this.addSound('explosion', new Howl({ src: ['assets/explosion.mp3'] }));
        this.setMusic(new Howl({
            src: ['assets/bgmusic.mp3'],
            volume: 0.1
        }));
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
        sound.load();
        this.library.set(name, sound);
    }

    public playSound(name: string) {
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
        sound.on('end', () => {
            setTimeout(() => {
                if (!this.playQueue.isEmpty())
                    this.playNext();
                else
                    this.isPlaying = false;
            }, this.delay);
        });
    }
}
