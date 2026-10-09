import { loadingAnimation } from './loading-animation';
import { createLoadingScreenStore, type LoadingScreenStore } from './loading-settings-store';
import type { Item, MediaApi } from './types';
import { button, el, replace } from './dom';
import { emptyHomeCollections, orderHomeItems, homeCollectionTabs, homeTabLabel, activeHomeRows, shuffleHomeItems, type HomeCollectionRow } from './home-collection-settings';
import { createHomeCollectionStore, type HomeCollectionStore } from './home-collection-store';
import { nativeHomeRows, rememberHomeRows } from './home-row-placement';
import { decorateSeasonalRow, refreshSeasonalBackdrop, refreshSeasonalDate, suspendSeasonalRow, resumeSeasonalRow } from './home-seasonal-appearance';
import { scrollSeasonalSelectionIntoView, seasonalNavigationTop, settleSeasonalSelection } from './home-seasonal-motion';
import { dailyAdvent } from './home-advent';
import { homeRowCard } from './home-row-card';
import { homeRowTabs } from './home-row-tabs';
import { HomeReadiness } from './home-readiness';
import { HomeChannelArtwork, clearHomeChannelArtwork } from './home-channel-artwork';
import { createProviderHomesStore, type ProviderHomesStore } from './provider-settings-store';
import type { ProviderHomesSettings, ProviderId } from './provider-settings';
import { providerHomeRow } from './provider-home';
import { isDesktopLayout } from './layout';
import { getAllWatchlistItems, subscribeWatchlist } from './watchlist';
import { HomeLibraryVisibility, homeLibraryExcludedClass } from './home-library-visibility';
import { restoreHomeItemAnchor, type HomeItemAnchor } from './home-return-position';

// ... rest of file unchanged ...

  private move(direction: string): boolean {
    const active = document.activeElement as HTMLElement;
    const host = this.root.parentElement;
    if (!host?.contains(active) || active.matches('input,textarea,select') || active.closest('.ec-root')) return false;
    const candidates = (group: HTMLElement) => Array.from(group.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]'));
    const usable = (node: HTMLElement) => !node.matches(':disabled') && !node.closest('.hide,[hidden]')
      && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
    if (direction === 'left' || direction === 'right') {
      const group = active.closest<HTMLElement>('.focuscontainer-x, .ec-root');
      if (!group || group.querySelector('.focuscontainer-x')) return false;
      const current = candidates(group), index = current.indexOf(active);
      if (index < 0) return false;
      // Horizontal movement can cross native and custom rows within the same
      // focus strip, but it must stop at the strip boundary instead of being
      // treated as a foreign control outside Home.
      const step = direction === 'right' ? 1 : -1;
      for (let next = index + step; next >= 0 && next < current.length; next += step) {
        if (usable(current[next])) { this.focus(current[next], true); break; }
      }
      return true;
    }
    const groups = Array.from(host.querySelectorAll<HTMLElement>('.focuscontainer-x, .ec-root'))
      .filter(group => !group.querySelector('.focuscontainer-x') && candidates(group).some(usable))
      // Native navigation uses screen geometry. Follow that same row order at
      // custom/native boundaries even when another plugin reorders native DOM.
      .map(group => ({ group, top: seasonalNavigationTop(group) }))
      .sort((a, b) => a.top - b.top).map(({ group }) => group);
    const groupIndex = groups.findIndex(group => group.contains(active));
    if (groupIndex < 0) return false;
    const current = candidates(groups[groupIndex]), activeIndex = current.indexOf(active);
    if (activeIndex < 0 || !usable(active)) return false;
    // Preserve the visible column without measuring posters after either
    // selection. Only a shorter destination needs a scan to its final item.
    const index = current.slice(0, activeIndex).filter(usable).length;
    const next = groups[groupIndex + (direction === 'down' ? 1 : -1)];
    if (!next) return false;
    const sameRow = active.closest('.tvl-home-collection-row') === next.closest('.tvl-home-collection-row');
    if (sameRow && next.classList.contains('tvl-home-source-tabs')) this.focus(next.querySelector<HTMLElement>('[aria-selected="true"]') || undefined);
    else {
      const targetIndex = sameRow && groups[groupIndex].classList.contains('tvl-home-source-tabs') ? 0 : index;
      let target: HTMLElement | undefined, visibleIndex = 0;
      for (const node of candidates(next)) if (usable(node)) {
        target = node;
        if (visibleIndex++ === targetIndex) break;
      }
      this.focus(target);
    }
    return !!next;
  }

// ... rest of file unchanged ...
