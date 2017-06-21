import { browser, element, by } from 'protractor';

export class BattleshipClientPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ccg-root h1')).getText();
  }
}
