import { TokenTracker, TokenTrackerMap } from './token-tracker.service';
import { MovingToken } from '../models/graph-data.model';

describe('TokenTracker', () => {
  let tokenTracker: TokenTracker;
  let trackerMap: TokenTrackerMap;

  beforeEach(() => {
    trackerMap = {
      place1: new Set([{ id: 'token1' }, { id: 'token2' }] as MovingToken[]),
      place2: new Set([{ id: 'token3' }] as MovingToken[]),
    };
    tokenTracker = new TokenTracker(trackerMap);
  });

  it('should initialize with the correct tokens', () => {
    expect(tokenTracker.tokens.size).toBe(3);
  });

  it('should return tokens at a specific place', () => {
    const tokensAtPlace1 = tokenTracker.getTokensAtPlace('place1');
    expect(tokensAtPlace1.size).toBe(2);
  });

  it('should set tokens at a specific place', () => {
    const newTokens = new Set([{ id: 'token4' }] as MovingToken[]);
    tokenTracker.setTokensAtPlace('place1', newTokens);

    const tokensAtPlace1 = tokenTracker.getTokensAtPlace('place1');
    expect(tokensAtPlace1.size).toBe(1);
    expect([...tokensAtPlace1][0].id).toBe('token4');
  });

  it('should add a token to a specific place', () => {
    const newToken = { id: 'token5' } as MovingToken;
    tokenTracker.addTokenToPlace('place1', newToken);

    const tokensAtPlace1 = tokenTracker.getTokensAtPlace('place1');
    expect(tokensAtPlace1.size).toBe(3);
    expect([...tokensAtPlace1].some((token) => token.id === 'token5')).toBe(
      true,
    );
  });

  it('should emit changes when tokens are added or removed', (done) => {
    tokenTracker.placeChanges$().subscribe((changes) => {
      expect(changes['place1']).toBeDefined();
      expect(changes['place1'].size).toBe(3);
      done();
    });

    const newToken = { id: 'token6' } as MovingToken;
    tokenTracker.addTokenToPlace('place1', newToken);
  });

  it('should complete the changes observable on dispose', () => {
    const completeSpy = jasmine.createSpy('completeSpy');
    tokenTracker.placeChanges$().subscribe({ complete: completeSpy });

    tokenTracker.dispose();
    expect(completeSpy).toHaveBeenCalled();
  });
});
