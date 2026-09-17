// Fire-and-forget analytics hook
// Tier 1 events tracked:
//   - 'page_view'          — on every page mount (with page name)
//   - 'feature_open'       — when Fly Finder, Hatch Calendar, Rigs, Trips sections are opened
//   - 'rig_expand'         — when a rig card is expanded (with rig_id, rig_name)
//   - 'shop_click'         — when "Shop →" button is tapped (with rig_id, shop_hint)
//   - 'fly_selected'       — when a fly is selected in Finder (with fly_id, fly_name)
//   - 'affiliate_click'    — when any affiliate/shop link is clicked (with target)
//   - 'water_mode_change'  — when user switches fresh/salt (with new_mode)
//   - 'trip_kit_open'      — when a trip kit is opened
//   - 'hatch_report_submit'— when hatch report form is submitted

// Module-level session ID — persists for the lifetime of the page load
// (avoids sessionStorage which is blocked in the preview iframe)
let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return _sessionId;
}

export function useTrack() {
  const track = (event: string, properties?: Record<string, unknown>) => {
    const sid = getSessionId();
    // Fire and forget — do not await, never throw
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties, session_id: sid }),
    }).catch(() => {}); // silent failure
  };
  return { track };
}
