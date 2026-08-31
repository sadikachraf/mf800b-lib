# MF800B Libya Ecommerce PDP

Mobile-first Arabic ecommerce product page for the **MF800B 4G LTE Portable WiFi** router in Libya.

## Commercial configuration

All commercial and integration values are centralized in `PRODUCT_CONFIG` at the top of `app.js`:

- SKU: `MF800B-LY`
- Order prefix: `MIFI-LY-`
- Country: `Libya`
- Currency: `LYD`
- Starting batch quantity (internal): `155`
- 1 device: `349 LYD`
- 2 devices: `599 LYD` (`299.5 LYD` per device)
- Google Sheets endpoint: shared Libya order endpoint
- Meta pixels: `778731385018899` and `1298885441635850`

Prices shown in the offer cards, primary price, final order block, and mobile sticky button are rendered from this configuration.

## Tracking policy

The storefront sends:

- `PageView` on page load
- `InitiateCheckout` on first order intent
- `Lead` after a valid COD form submission

COD submission is **not** treated as a completed sale. No frontend purchase-completion event is fired.

## Order handling

The order form preserves the shared Google Sheets payload shape, Libyan phone normalization/validation, order references, disabled submitting state, and recent duplicate prevention. Localhost QA skips the external sheet write and logs the payload in the browser console.

## Local preview

This is a dependency-free static site. Serve the project directory with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Gallery

The production gallery contains eight 1080×1080 WebP assets. Mobile uses horizontal scroll-snap with pagination; desktop uses a square main image and clickable square thumbnails. All product imagery is displayed without cover-cropping the MF800B or its packaging.

See `IMAGE_PROMPTS.md` for the asset provenance and production prompts.

