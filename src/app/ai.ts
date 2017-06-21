import { Game, GameActionType, GameAction, SyncGameEvent, GameEventType, } from './game_model/game';
import * as randomJs from 'random-js';
import { minBy, sample } from 'lodash';
const rng = new randomJs();


export enum AiDifficulty {
    Easy, Medium, Hard
}

export abstract class AI {
    constructor(
        protected playerNumber: number,
        protected game: Game,
        protected runGameAction: (type: GameActionType, params: any) => void
    ) { }

    abstract handleGameEvent(event: SyncGameEvent);
}
