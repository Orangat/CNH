/**
 * Supabase email links (invites, password resets) open the site with the session in the
 * hash, e.g. https://churchofnewhope.org/#access_token=…&type=invite. The Supabase client
 * reads that hash asynchronously, and by then the router may already have redirected
 * "/" → "/en" and dropped it. So this module runs before the app starts (it is the first
 * import in index.tsx): it moves such links to the set-password page, keeping the hash.
 */
export const SET_PASSWORD_PATH = '/admin/set-password';

const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
const linkType = hashParams.get('type');

/** Set when the app was opened from an expired or already-used email link. */
export const emailLinkFailed = hashParams.has('error_description');

const isEmailLink =
  emailLinkFailed ||
  (hashParams.has('access_token') && (linkType === 'invite' || linkType === 'recovery'));

if (isEmailLink && window.location.pathname !== SET_PASSWORD_PATH) {
  window.history.replaceState(null, '', SET_PASSWORD_PATH + window.location.hash);
}
