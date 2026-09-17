/**
 * useReviewPrompt — triggers Apple/browser in-app review at high-satisfaction moments.
 *
 * Uses __Host- prefixed cookies (required in published sandbox).
 * Prompts at most once per 60 days. Triggers on:
 *   1. First successful fly search result
 *   2. First trip kit save
 *   3. 3rd+ session visit
 *
 * On web (non-native), opens the App Store rating page as a fallback.
 */

const COOKIE_VISIT   = "__Host-rv_visits";
const COOKIE_SHOWN   = "__Host-rv_shown";
const COOKIE_SEARCH  = "__Host-rv_searched";
const COOKIE_KIT     = "__Host-rv_kitsaved";
const APP_STORE_URL  = "https://apps.apple.com/app/flydentify/id0000000000"; // replace with real App Store ID at launch
const MIN_DAYS_BETWEEN = 60;

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDays = 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 86400}; SameSite=Strict; Secure`;
}

function canShowPrompt(): boolean {
  const lastShown = getCookie(COOKIE_SHOWN);
  if (!lastShown) return true;
  const daysSince = (Date.now() - parseInt(lastShown, 10)) / 86400000;
  return daysSince >= MIN_DAYS_BETWEEN;
}

function markShown() {
  setCookie(COOKIE_SHOWN, Date.now().toString(), 365);
}

function triggerPrompt() {
  if (!canShowPrompt()) return;
  markShown();

  // Native iOS / Android via WKWebView message handler (if app shell exists)
  if ((window as any).webkit?.messageHandlers?.requestReview) {
    (window as any).webkit.messageHandlers.requestReview.postMessage(null);
    return;
  }

  // Android WebView
  if ((window as any).Android?.requestReview) {
    (window as any).Android.requestReview();
    return;
  }

  // Web fallback — open App Store review page after a short delay
  // Only do this if the user has been active for a while (not on first open)
  setTimeout(() => {
    const visits = parseInt(getCookie(COOKIE_VISIT) || "0", 10);
    if (visits >= 3) {
      // Show a subtle in-page toast rather than a disruptive popup
      const event = new CustomEvent("flydentify:review-prompt", {
        detail: { url: APP_STORE_URL }
      });
      window.dispatchEvent(event);
    }
  }, 2000);
}

// ── Public functions called at trigger moments ────────────────────────────────

/** Call after a successful fly search returns results */
export function trackSearchSuccess() {
  const already = getCookie(COOKIE_SEARCH);
  if (already) return; // only trigger once
  setCookie(COOKIE_SEARCH, "1");
  // Delay slightly so user sees results first
  setTimeout(triggerPrompt, 3000);
}

/** Call after a trip kit is saved for the first time */
export function trackKitSaved() {
  const already = getCookie(COOKIE_KIT);
  if (already) return;
  setCookie(COOKIE_KIT, "1");
  setTimeout(triggerPrompt, 2000);
}

/** Call on app mount — increments visit count and triggers on 3rd visit */
export function trackVisit() {
  const visits = parseInt(getCookie(COOKIE_VISIT) || "0", 10) + 1;
  setCookie(COOKIE_VISIT, visits.toString());
  if (visits === 3) {
    // Wait a moment so the page has settled
    setTimeout(triggerPrompt, 5000);
  }
}
