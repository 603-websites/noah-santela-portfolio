// Santella Designs -> Website Upgrader Pro SaaS config.
// External file (not an inline block) so the page keeps a strict
// script-src 'self' CSP with no 'unsafe-inline'. Must load before script.js.
// Replace the placeholder with Santella's real tenant key after Louis
// provisions the tenant (see SANTELLA_SETUP.md).
window.SANTELLA_SAAS = {
  base: 'https://www.websiteupgraderpro.com',
  apiKey: 'REPLACE_WITH_SANTELLA_TENANT_KEY',
};
