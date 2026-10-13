import { describe, expect, it } from 'vitest';
import { resolveTarget } from '../../../src/scan.js';
import { fixture } from '../../helpers.js';

describe('resolveTarget', () => {
  it('sends an HTML fragment to the source engine', () => {
    expect(resolveTarget(fixture('angular/card.component.html'))).toEqual({ source: fixture('angular/card.component.html') });
  });

  it('sends a directory to the source engine', () => {
    expect(resolveTarget(fixture('react/web'))).toEqual({ source: fixture('react/web') });
  });

  it('sends a source file to the source engine', () => {
    expect(resolveTarget(fixture('react/web/Page.tsx'))).toEqual({ source: fixture('react/web/Page.tsx') });
  });

  it('sends an HTML file to the web engine', () => {
    expect(resolveTarget(fixture('html/good.html'))).toEqual({ url: `file://${fixture('html/good.html')}` });
  });
});
