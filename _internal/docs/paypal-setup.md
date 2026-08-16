# PayPal setup for santelladesigns.com

The site now has a "Pay with PayPal" button built into the contact section. It
is **hidden until a payment link is added**, so nothing changes on the live site
until Noah's PayPal is ready.

## Why this approach

The site is a static site (no server) with a strict Content-Security-Policy that
blocks third-party scripts. The lowest-friction option that fits is a **PayPal
hosted payment link / button**: the button on the site is just a link that sends
the customer to a PayPal-hosted checkout page. Benefits:

- No backend and no code changes needed after the link is pasted in.
- No change to the site's security policy (a link is not a script).
- Noah manages products and prices from his PayPal dashboard; edits there update
  the checkout automatically.
- Customers can pay with a card without a PayPal account.

The alternative (PayPal's JavaScript SDK / in-page smart buttons) would require
loosening the site's Content-Security-Policy and more maintenance. It is only
worth it if we later want checkout to happen without leaving the site. Not needed
now.

## What Noah needs to do (one time)

Pick ONE of these two ways to get a payment URL:

### Option A - PayPal.me (fastest, good for deposits / flexible amounts)
1. Go to https://www.paypal.com/paypalme and claim a link, e.g. `paypal.me/noahsantella`.
2. That URL is the payment link. The customer types the amount to pay.

### Option B - Hosted payment link / button (best for fixed-price pieces)
1. Log in to the PayPal **Business** account.
2. Go to **Pay & Get Paid -> PayPal.Me / Payment links and buttons**
   (the "Build Your Payment Links and Buttons" screen Noah was already on).
3. Create a product/service with a name, description, and price, then generate
   the **payment link** (a URL). A QR code is also produced if he wants one for
   in-person sales.
4. Copy that URL.

> A business account is required to accept card payments and to use hosted
> buttons. If Noah only has a personal account, upgrading is free in account
> settings.

## What we do (one line of code)

1. Open `script.js`.
2. Near the top, set the link:
   ```js
   var PAYPAL_PAYMENT_LINK = "https://www.paypal.com/...";  // or "https://paypal.me/noahsantella"
   ```
3. Save, commit, push. The "Pay with PayPal" button appears automatically in the
   contact section. Leaving the value as `""` keeps the button hidden.

## Where it shows

Contact section ("Inquire"), under Noah's email, as a "Secure Payment" block.
Fits the current flow: a client inquires, agrees on a piece/commission/deposit
with Noah, then pays via the button. If we later want a "Buy" button per piece
in the gallery, each piece just needs its own hosted payment link.

## Testing before going live

- PayPal offers a **sandbox** (test) environment at developer.paypal.com if we
  want to test the full flow with fake money before using the real link.
- Simplest real-world check: paste the link, load the site, click the button,
  and confirm it opens Noah's PayPal checkout in a new tab. Do not complete a
  real payment unless testing with a small real amount.
