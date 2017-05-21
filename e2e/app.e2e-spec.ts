import { BattleshipClientPage } from './app.po';

describe('battleship-client App', () => {
  let page: BattleshipClientPage;

  beforeEach(() => {
    page = new BattleshipClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('bsc works!');
  });
});
