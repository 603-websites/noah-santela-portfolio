/* Santella Designs -> Oryx platform configuration.
 *
 * This lives in its own file, rather than an inline <script>, so the page can
 * keep a strict `script-src 'self'` CSP with no 'unsafe-inline'.
 *
 * About the key: this is a per-organization *publishable* key. It is readable
 * by anyone who views the page source, and that is by design. It only permits
 * submitting this organization's own forms; it cannot read submissions or any
 * other tenant's data. Access is constrained server side by the Connected
 * Sites origin allow-list plus per-organization rate limiting. It is the same
 * pattern already in production on the other Oryx client sites.
 *
 * NOT YET PROVISIONED. Replace the placeholder below with the `wup_...` key
 * generated for the Santella organization in the Oryx admin. Until then the
 * inquiry forms fail closed: visitors get an honest error telling them to
 * email Noah directly, and no inquiry is silently dropped.
 */
window.SANTELLA_SAAS = {
  base: "https://oryxtechnologiesllc.com",
  apiKey: "REPLACE_WITH_SANTELLA_API_KEY"
};
