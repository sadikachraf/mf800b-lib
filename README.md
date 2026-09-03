# 4G/5G Pocket WiFi Libya Ecommerce PDP

Mobile-first Arabic ecommerce product page for the **4G/5G Pocket WiFi** router (model MF800B) in Libya.

## Commercial configuration

All commercial and integration values are centralized in `PRODUCT_CONFIG` at the top of `app.js`:

- SKU: `DRP70733`
- Order prefix: `MIFI-LY-`
- Country: `Libya`
- Currency: `LYD`
- Starting batch quantity (internal): `155`
- 1 device: `279 LYD`
- 2 devices: `449 LYD` (`224.5 LYD` per device, saving `109 LYD`)
- 3 devices: `599 LYD` (`199.7 LYD` per device, saving `238 LYD`)
- Google Sheets endpoint: shared Libya order endpoint
- Meta pixels: `778731385018899` and `1298885441635850`

Prices shown in the offer cards, final order block, and mobile sticky button are rendered from this configuration.

## Tracking policy

The storefront sends:

- `PageView` on page load
- `InitiateCheckout` on first order intent
- `Lead` after a successful COD order registration
- `Purchase` after a successful COD order registration, with the order value, quantity, SKU, currency, and unique order reference

The unique order reference is also sent as the browser event ID so the same order can be deduplicated if server-side tracking is added later.

## Order handling

The order form preserves the shared Google Sheets payload shape, Libyan phone normalization/validation, order references, disabled submitting state, and recent duplicate prevention. Localhost QA skips the external sheet write and logs the payload in the browser console.

## Approved image set

The ten production WebPs are direct, composition-preserving conversions of the approved 1254×1254 PNG masters supplied in `MF800B-final-images-for-codex.zip`. No image generation, redesign, crop, or text overlay is used.

The eight-slide gallery order is:

1. `hero-power-cut-main.webp`
2. `real-product-packaging.webp`
3. `how-it-works.webp`
4. `multi-device-wifi.webp`
5. `portability.webp`
6. `features.webp`
7. `sim-explainer.webp`
8. `work-study.webp`

Supporting section assets are `power-cut-lifestyle.webp` and `travel-car.webp`. Mobile uses horizontal scroll-snap with pagination; desktop uses a square main image and clickable square thumbnails. Every image is displayed at 1:1 with `object-fit: contain`.

Five customer photo reviews are stored in `images/reviews/`. The supplied 1254×1254 PNG originals were resized to 960×960 and compressed as WebP files for fast loading. They appear below the primary order form in a responsive carousel with touch swiping, scroll snapping, progress indicators, and keyboard/button navigation.

See `IMAGE_PROMPTS.md` for the approved asset manifest and provenance note.

## Local preview

This is a dependency-free static site. Serve the project directory with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
