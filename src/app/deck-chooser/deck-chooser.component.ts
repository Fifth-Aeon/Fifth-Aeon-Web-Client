import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';

import { WebClient } from '../client';
import { DecksService } from '../decks.service';
import { GameFormat, standardFormat } from '../game_model/gameFormat';
import { DeckList } from '../game_model/deckList';
import { allCards } from '../game_model/cards/allCards';
import { Card } from '../game_model/card';

@Component({
  templateUrl: './deck-chooser.component.html',
  styleUrls: ['./deck-chooser.component.scss']
})
export class DeckChooserComponent implements OnInit {
  constructor(public decksService: DecksService) { }
  ngOnInit() { }
}
