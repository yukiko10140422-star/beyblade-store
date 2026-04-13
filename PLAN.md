Now I have enough research to produce the comprehensive plan. Let me compile everything.

---

# Beyblade Specialty Shopify Hydrogen Store -- Complete Implementation Plan

## Phase 1: Foundation

### 1.1 Scaffolding

Run the following from `C:\Users\k3n70\desktop\shopify`:

```bash
npm create @shopify/hydrogen@latest -- --quickstart
```

When prompted:
- Project name: `beyblade-store`
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- Install dependencies: **Yes**

After scaffold, install additional dependencies:

```bash
cd beyblade-store

# i18n string translations
npm install i18next react-i18next i18next-browser-languagedetector

# Animation library -- lightweight, composable, GPU-accelerated
npm install framer-motion

# Utility for conditional classnames
npm install clsx

# Schema.org JSON-LD generation with type safety
npm install schema-dts

# Image zoom on PDP gallery
npm install react-medium-image-zoom

# Swiper for carousels (hero, related products)
npm install swiper

# Country/currency flag display
npm install country-flag-icons
```

Reasoning for each:
- **i18next + react-i18next**: The Shopify Storefront API handles translated product content via `@inContext`, but UI strings (button labels, navigation text, footer text, error messages) need a client-side translation library. i18next is the most battle-tested option with namespace support and lazy loading.
- **i18next-browser-languagedetector**: For initial geo-detection of visitor language before they make a selection.
- **framer-motion**: Beyblade is a high-energy brand. Static pages will not convey the excitement. Framer Motion provides layout animations, scroll-triggered reveals, and spring physics for spinning effects at ~30KB gzipped.
- **clsx**: Cleaner conditional Tailwind class composition than template literals.
- **schema-dts**: TypeScript types for Schema.org vocabulary so JSON-LD is type-checked at build time.
- **react-medium-image-zoom**: Product images of detailed Beyblade parts need zoom. This library is accessible (keyboard/screen reader support) and under 5KB.
- **swiper**: The standard for touch-enabled carousels. Used for hero slides, product image gallery on mobile, and related product rows.
- **country-flag-icons**: SVG flags for the locale selector dropdown; no external HTTP requests.

### 1.2 Project File Structure

After scaffold, the target structure will be:

```
beyblade-store/
  app/
    components/
      layout/
        Header.tsx
        Footer.tsx
        MegaMenu.tsx
        MobileNav.tsx
        LocaleSelector.tsx
        AnnouncementBar.tsx
      product/
        ProductGallery.tsx
        VariantSelector.tsx
        TypeBadge.tsx           # Attack/Defense/Stamina/Balance badge
        PartsCompatibility.tsx
        MetafieldDisplay.tsx
        RelatedProducts.tsx
        ProductCard.tsx
      cart/
        CartDrawer.tsx
        CartLineItem.tsx
        CartUpsell.tsx
        CartSummary.tsx
        ShippingEstimate.tsx
      search/
        PredictiveSearch.tsx
        SearchResults.tsx
        SearchFilters.tsx
      common/
        Button.tsx
        Badge.tsx
        Skeleton.tsx
        ErrorBoundary.tsx
        Spinner.tsx
        Container.tsx
        Breadcrumbs.tsx
      seo/
        JsonLd.tsx
        HreflangTags.tsx
    hooks/
      useLocale.ts
      useTranslation.ts
      useShippingEstimate.ts
      usePartsCompatibility.ts
    lib/
      i18n/
        config.ts
        locales.ts
        translations/
          en.json
          fr.json
          ko.json
          pt-BR.json
          ms.json
          ja.json
      shipping/
        zones.ts
        rates.ts
        estimator.ts
      seo/
        jsonld.ts
        meta.ts
      fragments.ts
      utils.ts
    routes/
      ($locale)._index.tsx
      ($locale).products.$handle.tsx
      ($locale).collections._index.tsx
      ($locale).collections.$handle.tsx
      ($locale).cart.tsx
      ($locale).search.tsx
      ($locale).pages.$handle.tsx
      ($locale).pages.shipping.tsx
      ($locale).pages.about.tsx
      ($locale).pages.compatibility.tsx
      [sitemap.xml].tsx
      [robots.txt].tsx
    root.tsx
    entry.server.tsx
    entry.client.tsx
  public/
    fonts/
      Rajdhani-Bold.woff2
      Rajdhani-SemiBold.woff2
      Rajdhani-Regular.woff2
      NotoSansKR-Variable.woff2
      NotoSansJP-Variable.woff2
    images/
      type-icons/
        attack.svg
        defense.svg
        stamina.svg
        balance.svg
  server.ts
  tailwind.config.ts
  vite.config.ts
```

### 1.3 Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand -- derived from Beyblade X's electric blue/cyan energy aura
        primary: {
          50:  '#eef8ff',
          100: '#d8eeff',
          200: '#b9e0ff',
          300: '#89ceff',
          400: '#52b2ff',
          500: '#2a91ff',   // Main brand action color
          600: '#0d6efd',   // Buttons, links
          700: '#0c59e0',
          800: '#1048b5',
          900: '#13408e',
          950: '#0f2756',
        },
        // Secondary -- Beyblade X gold/yellow accent (used in logo, premium elements)
        accent: {
          50:  '#fffbeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd149',   // Highlight, badges, sale tags
          400: '#ffbd20',
          500: '#f99b07',
          600: '#dd7302',
          700: '#b74e06',
          800: '#943b0c',
          900: '#7a320d',
          950: '#461802',
        },
        // Beyblade type colors (official from Beyblade X bit coloring)
        bey: {
          attack:  '#3B82F6', // Blue -- aggressive, fast
          defense: '#22C55E', // Green -- solid, protective
          stamina: '#F97316', // Orange -- endurance, heat
          balance: '#EF4444', // Red -- hybrid, versatile
        },
        // Dark background palette (stadium/arena feel)
        arena: {
          50:  '#f6f6f9',
          100: '#ededf1',
          200: '#d7d7e0',
          300: '#b4b4c5',
          400: '#8b8ba5',
          500: '#6d6d8a',
          600: '#575772',
          700: '#47475d',
          800: '#2d2d3f',   // Card backgrounds
          900: '#1a1a2e',   // Main dark background
          950: '#0d0d1a',   // Deepest dark
        },
      },
      fontFamily: {
        // Rajdhani: geometric, angular, high-tech feel matching Beyblade's aesthetic
        heading: ['Rajdhani', 'system-ui', 'sans-serif'],
        // Inter for body: highly legible, excellent for multi-language
        body: ['Inter', 'Noto Sans JP', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Custom scale for headings that feel bold and impactful
        'display-xl': ['4.5rem',   { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem',  { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['3rem',     { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-xl': ['2.25rem',  { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading':    ['1.5rem',   { lineHeight: '1.25', fontWeight: '600' }],
        'heading-sm': ['1.25rem',  { lineHeight: '1.3', fontWeight: '600' }],
      },
      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'spin-fast':    'spin 0.5s linear infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'slide-up':     'slide-up 0.5s ease-out',
        'slide-down':   'slide-down 0.3s ease-out',
        'fade-in':      'fade-in 0.3s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(42, 145, 255, 0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(42, 145, 255, 0.6), 0 0 40px rgba(42, 145, 255, 0.2)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-grid': 'linear-gradient(rgba(13,13,26,0.85), rgba(13,13,26,0.95)), url("/images/stadium-pattern.svg")',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 1.4 Design System: Visual Identity

**Overall Aesthetic Direction**: The store uses a dark-mode-first design inspired by the Beyblade X stadium environment. The background is deep navy/black (`arena-950` to `arena-900`), with cards floating on slightly lighter surfaces (`arena-800`). Accent lighting comes from electric blue (`primary-500`) glows and gold (`accent-300`) highlights. This creates a premium, collectible feel while evoking the high-energy arena atmosphere of Beyblade battles.

**Why dark mode first**: Beyblade products are photographed against dark backgrounds in official Takara Tomy media. The metallic parts of Beyblade X (chrome, blue chrome, gold) pop dramatically against dark surfaces. A white-background store would look generic; the dark arena theme is immediately recognizable as a Beyblade destination.

**Typography decisions**:
- **Rajdhani** for headings: This is a geometric, slightly condensed sans-serif with angular characteristics that match Beyblade's tech/mecha aesthetic. Its sharp angles echo the blade shapes.
- **Inter** for body text: Maximum legibility across all target languages. Combined with Noto Sans JP and Noto Sans KR as fallbacks, it handles Latin, Japanese, and Korean scripts cleanly.
- The font stack declaration means: try Inter first, fall back to Noto Sans JP for Japanese glyphs, Noto Sans KR for Korean, then system fonts.

**Spacing system**: Use Tailwind's default 4px base grid (p-1 = 4px, p-2 = 8px, etc.). Content containers are max-w-7xl (1280px) centered. Product grids use gap-4 on mobile, gap-6 on desktop. Section vertical spacing is py-12 on mobile, py-20 on desktop.

**Component pattern**: Every interactive component has four states:
1. **Default**: Base appearance
2. **Hover/Focus**: Blue glow border (`ring-2 ring-primary-500/50`), slight scale (`scale-[1.02]`)
3. **Active/Pressed**: Darker variant, scale back to 1.0
4. **Disabled**: opacity-50 with cursor-not-allowed

**Button variants**:
- **Primary**: `bg-primary-600 hover:bg-primary-500 text-white` with subtle glow on hover
- **Secondary**: `bg-arena-800 border border-arena-600 hover:border-primary-500 text-white`
- **Accent**: `bg-accent-400 hover:bg-accent-300 text-arena-950` (for "Add to Cart", limited edition callouts)
- **Ghost**: `bg-transparent hover:bg-arena-800 text-arena-300`

**Card pattern**: `bg-arena-800/80 backdrop-blur-sm border border-arena-700 rounded-lg`. On hover: `border-primary-500/30 shadow-lg shadow-primary-500/5`.

---

## Phase 2: Internationalization

### 2.1 Locale Configuration

```ts
// app/lib/i18n/locales.ts

export type Locale = {
  language: string;          // Storefront API LanguageCode
  country: string;           // Storefront API CountryCode
  label: string;             // Display name in native language
  currency: string;          // ISO 4217
  pathPrefix: string;        // URL prefix (empty string for default)
  hreflang: string;          // For SEO hreflang tags
  dateLocale: string;        // For Intl.DateTimeFormat
  direction: 'ltr' | 'rtl';
};

export const DEFAULT_LOCALE: Locale = {
  language: 'EN',
  country: 'US',
  label: 'English (US)',
  currency: 'USD',
  pathPrefix: '',
  hreflang: 'en-us',
  dateLocale: 'en-US',
  direction: 'ltr',
};

export const SUPPORTED_LOCALES: Record<string, Locale> = {
  'en-us': DEFAULT_LOCALE,
  'en-ca': {
    language: 'EN', country: 'CA', label: 'English (Canada)',
    currency: 'CAD', pathPrefix: 'en-ca', hreflang: 'en-ca',
    dateLocale: 'en-CA', direction: 'ltr',
  },
  'en-gb': {
    language: 'EN', country: 'GB', label: 'English (UK)',
    currency: 'GBP', pathPrefix: 'en-gb', hreflang: 'en-gb',
    dateLocale: 'en-GB', direction: 'ltr',
  },
  'en-au': {
    language: 'EN', country: 'AU', label: 'English (Australia)',
    currency: 'AUD', pathPrefix: 'en-au', hreflang: 'en-au',
    dateLocale: 'en-AU', direction: 'ltr',
  },
  'fr-fr': {
    language: 'FR', country: 'FR', label: 'Francais',
    currency: 'EUR', pathPrefix: 'fr', hreflang: 'fr-fr',
    dateLocale: 'fr-FR', direction: 'ltr',
  },
  'ko-kr': {
    language: 'KO', country: 'KR', label: '한국어',
    currency: 'KRW', pathPrefix: 'ko', hreflang: 'ko-kr',
    dateLocale: 'ko-KR', direction: 'ltr',
  },
  'pt-br': {
    language: 'PT_BR', country: 'BR', label: 'Portugues (Brasil)',
    currency: 'BRL', pathPrefix: 'pt-br', hreflang: 'pt-br',
    dateLocale: 'pt-BR', direction: 'ltr',
  },
  'ms-my': {
    language: 'MS', country: 'MY', label: 'Bahasa Melayu',
    currency: 'MYR', pathPrefix: 'ms', hreflang: 'ms-my',
    dateLocale: 'ms-MY', direction: 'ltr',
  },
  'ja-jp': {
    language: 'JA', country: 'JP', label: '日本語',
    currency: 'JPY', pathPrefix: 'ja', hreflang: 'ja-jp',
    dateLocale: 'ja-JP', direction: 'ltr',
  },
};
```

### 2.2 Locale Resolution from Request

The locale is extracted from the URL path prefix in `server.ts` and threaded through to the Hydrogen storefront client:

```ts
// In server.ts -- inside getLoadContext or equivalent

function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();

  // Check if first path segment matches any locale prefix
  for (const [key, locale] of Object.entries(SUPPORTED_LOCALES)) {
    if (locale.pathPrefix && locale.pathPrefix === firstSegment) {
      return locale;
    }
  }

  // No prefix match -- return default locale (en-us)
  return DEFAULT_LOCALE;
}
```

This locale is then passed to `createStorefrontClient`:

```ts
const {storefront} = createStorefrontClient({
  // ... other config
  i18n: getLocaleFromRequest(request),
});
```

### 2.3 Route Pattern for Locale Prefixes

Every customer-facing route uses the `($locale)` optional parameter:

```
app/routes/($locale)._index.tsx        -> / or /fr or /ko
app/routes/($locale).products.$handle.tsx -> /products/dran-sword or /fr/products/dran-sword
```

The `($locale)` segment is optional -- when absent, it resolves to the default locale (en-us). Inside each route loader, the locale comes from the storefront client context which was already resolved in server.ts.

### 2.4 @inContext Threading

Every Storefront API query must include the `@inContext` directive. Here is the concrete pattern:

```ts
// app/routes/($locale).products.$handle.tsx

const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      vendor
      productType
      tags
      seo {
        title
        description
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
      # Beyblade-specific metafields
      beybladeType: metafield(namespace: "beyblade", key: "type") {
        value
        type
      }
      bladeName: metafield(namespace: "beyblade", key: "blade_name") {
        value
      }
      ratchetSpec: metafield(namespace: "beyblade", key: "ratchet_spec") {
        value
      }
      bitSpec: metafield(namespace: "beyblade", key: "bit_spec") {
        value
      }
      series: metafield(namespace: "beyblade", key: "series") {
        value
      }
      productLine: metafield(namespace: "beyblade", key: "product_line") {
        value
      }
      compatibleParts: metafield(namespace: "beyblade", key: "compatible_parts") {
        value
        type
      }
      weightGrams: metafield(namespace: "beyblade", key: "weight_grams") {
        value
      }
      releaseDate: metafield(namespace: "beyblade", key: "release_date") {
        value
      }
      modelNumber: metafield(namespace: "beyblade", key: "model_number") {
        value
      }
    }
  }
` as const;

// In the loader:
export async function loader({params, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {handle} = params;

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      // These are automatically injected from storefront.i18n:
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return {product};
}
```

### 2.5 Translation Files

UI string translations (not product data -- that comes from Shopify). Sample structure:

```json
// app/lib/i18n/translations/en.json
{
  "nav": {
    "home": "Home",
    "shop": "Shop All",
    "series": "Series",
    "parts": "Parts",
    "compatibility": "Compatibility Checker",
    "shipping": "Shipping Info",
    "about": "About Us",
    "search": "Search",
    "cart": "Cart",
    "account": "Account"
  },
  "product": {
    "addToCart": "Add to Cart",
    "soldOut": "Sold Out",
    "preOrder": "Pre-Order",
    "quantity": "Quantity",
    "type": "Type",
    "blade": "Blade",
    "ratchet": "Ratchet",
    "bit": "Bit",
    "specifications": "Specifications",
    "compatibleWith": "Compatible With",
    "relatedProducts": "You May Also Like",
    "reviews": "Reviews",
    "shippingEstimate": "Estimated delivery to {{country}}: {{days}} business days",
    "weight": "Weight",
    "series": "Series",
    "productLine": "Product Line",
    "releaseDate": "Release Date",
    "modelNumber": "Model Number",
    "attack": "Attack",
    "defense": "Defense",
    "stamina": "Stamina",
    "balance": "Balance"
  },
  "cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty",
    "continueShopping": "Continue Shopping",
    "subtotal": "Subtotal",
    "shipping": "Shipping calculated at checkout",
    "checkout": "Proceed to Checkout",
    "remove": "Remove",
    "youMightAlsoLike": "Complete Your Setup"
  },
  "search": {
    "placeholder": "Search blades, parts, series...",
    "noResults": "No results found for \"{{query}}\"",
    "suggestions": "Popular Searches",
    "products": "Products",
    "collections": "Collections",
    "pages": "Pages"
  },
  "shipping": {
    "freeOver": "Free shipping on orders over {{amount}}",
    "estimatedDelivery": "Estimated Delivery",
    "daysRange": "{{min}}-{{max}} business days",
    "fromJapan": "Ships directly from Japan",
    "customsDuties": "Customs & Import Duties",
    "dutiesNote": "Import duties and taxes may apply and are the responsibility of the buyer. Amounts vary by country.",
    "trackingIncluded": "Tracking included with all orders"
  },
  "footer": {
    "customerService": "Customer Service",
    "aboutUs": "About Us",
    "shippingPolicy": "Shipping Policy",
    "returnPolicy": "Return Policy",
    "contactUs": "Contact Us",
    "faq": "FAQ",
    "shop": "Shop",
    "allProducts": "All Products",
    "newArrivals": "New Arrivals",
    "newsletter": "Stay Updated",
    "newsletterDesc": "Get notified about new releases and exclusive drops.",
    "emailPlaceholder": "Enter your email",
    "subscribe": "Subscribe",
    "copyright": "All rights reserved.",
    "beybladeDisclaimer": "Beyblade is a trademark of Takara Tomy. This store is not affiliated with Takara Tomy."
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try Again",
    "viewAll": "View All",
    "backToHome": "Back to Home",
    "pageNotFound": "Page Not Found",
    "pageNotFoundDesc": "The page you are looking for does not exist."
  }
}
```

```json
// app/lib/i18n/translations/fr.json
{
  "nav": {
    "home": "Accueil",
    "shop": "Boutique",
    "series": "Series",
    "parts": "Pieces",
    "compatibility": "Compatibilite",
    "shipping": "Livraison",
    "about": "A propos",
    "search": "Rechercher",
    "cart": "Panier",
    "account": "Compte"
  },
  "product": {
    "addToCart": "Ajouter au panier",
    "soldOut": "Epuise",
    "preOrder": "Pre-commande",
    "quantity": "Quantite",
    "type": "Type",
    "blade": "Lame",
    "ratchet": "Cliquet",
    "bit": "Embout",
    "specifications": "Specifications",
    "compatibleWith": "Compatible avec",
    "relatedProducts": "Vous aimerez aussi",
    "reviews": "Avis",
    "shippingEstimate": "Livraison estimee vers {{country}} : {{days}} jours ouvrables",
    "weight": "Poids",
    "series": "Serie",
    "productLine": "Gamme",
    "releaseDate": "Date de sortie",
    "modelNumber": "Reference",
    "attack": "Attaque",
    "defense": "Defense",
    "stamina": "Endurance",
    "balance": "Equilibre"
  },
  "cart": {
    "title": "Votre panier",
    "empty": "Votre panier est vide",
    "continueShopping": "Continuer vos achats",
    "subtotal": "Sous-total",
    "shipping": "Frais de port calcules a la caisse",
    "checkout": "Passer la commande",
    "remove": "Supprimer",
    "youMightAlsoLike": "Completez votre configuration"
  },
  "search": {
    "placeholder": "Rechercher lames, pieces, series...",
    "noResults": "Aucun resultat pour \"{{query}}\"",
    "suggestions": "Recherches populaires",
    "products": "Produits",
    "collections": "Collections",
    "pages": "Pages"
  },
  "shipping": {
    "freeOver": "Livraison gratuite des {{amount}}",
    "estimatedDelivery": "Livraison estimee",
    "daysRange": "{{min}}-{{max}} jours ouvrables",
    "fromJapan": "Expedie directement du Japon",
    "customsDuties": "Droits de douane et taxes",
    "dutiesNote": "Des droits et taxes d'importation peuvent s'appliquer et sont a la charge de l'acheteur.",
    "trackingIncluded": "Suivi inclus avec toutes les commandes"
  }
}
```

```json
// app/lib/i18n/translations/ko.json
{
  "nav": {
    "home": "홈",
    "shop": "전체 상품",
    "series": "시리즈",
    "parts": "파츠",
    "compatibility": "호환성 체크",
    "shipping": "배송 정보",
    "about": "소개",
    "search": "검색",
    "cart": "장바구니",
    "account": "계정"
  },
  "product": {
    "addToCart": "장바구니에 담기",
    "soldOut": "품절",
    "preOrder": "사전 주문",
    "quantity": "수량",
    "type": "타입",
    "blade": "블레이드",
    "ratchet": "래칫",
    "bit": "비트",
    "specifications": "사양",
    "compatibleWith": "호환 가능",
    "relatedProducts": "추천 상품",
    "reviews": "리뷰",
    "shippingEstimate": "{{country}}까지 예상 배송: 영업일 기준 {{days}}일",
    "weight": "무게",
    "series": "시리즈",
    "productLine": "제품 라인",
    "releaseDate": "출시일",
    "modelNumber": "모델 번호",
    "attack": "어택",
    "defense": "디펜스",
    "stamina": "스태미나",
    "balance": "밸런스"
  },
  "cart": {
    "title": "장바구니",
    "empty": "장바구니가 비어 있습니다",
    "continueShopping": "쇼핑 계속하기",
    "subtotal": "소계",
    "shipping": "배송비는 결제 시 계산됩니다",
    "checkout": "결제하기",
    "remove": "삭제",
    "youMightAlsoLike": "세트 완성하기"
  },
  "search": {
    "placeholder": "블레이드, 파츠, 시리즈 검색...",
    "noResults": "\"{{query}}\"에 대한 결과가 없습니다",
    "suggestions": "인기 검색어",
    "products": "상품",
    "collections": "컬렉션",
    "pages": "페이지"
  }
}
```

```json
// app/lib/i18n/translations/pt-BR.json
{
  "nav": {
    "home": "Inicio",
    "shop": "Loja",
    "series": "Series",
    "parts": "Pecas",
    "compatibility": "Verificador de Compatibilidade",
    "shipping": "Informacoes de Envio",
    "about": "Sobre Nos",
    "search": "Buscar",
    "cart": "Carrinho",
    "account": "Conta"
  },
  "product": {
    "addToCart": "Adicionar ao Carrinho",
    "soldOut": "Esgotado",
    "preOrder": "Pre-venda",
    "quantity": "Quantidade",
    "type": "Tipo",
    "blade": "Lamina",
    "ratchet": "Catraca",
    "bit": "Ponteira",
    "specifications": "Especificacoes",
    "compatibleWith": "Compativel com",
    "relatedProducts": "Voce tambem pode gostar",
    "attack": "Ataque",
    "defense": "Defesa",
    "stamina": "Resistencia",
    "balance": "Equilibrio"
  }
}
```

```json
// app/lib/i18n/translations/ms.json
{
  "nav": {
    "home": "Utama",
    "shop": "Kedai",
    "series": "Siri",
    "parts": "Bahagian",
    "compatibility": "Semakan Keserasian",
    "shipping": "Maklumat Penghantaran",
    "about": "Tentang Kami",
    "search": "Cari",
    "cart": "Troli",
    "account": "Akaun"
  },
  "product": {
    "addToCart": "Tambah ke Troli",
    "soldOut": "Habis Dijual",
    "preOrder": "Pra-Pesanan",
    "quantity": "Kuantiti",
    "type": "Jenis",
    "blade": "Bilah",
    "ratchet": "Ratchet",
    "bit": "Bit",
    "specifications": "Spesifikasi",
    "attack": "Serangan",
    "defense": "Pertahanan",
    "stamina": "Stamina",
    "balance": "Seimbang"
  }
}
```

```json
// app/lib/i18n/translations/ja.json
{
  "nav": {
    "home": "ホーム",
    "shop": "全商品",
    "series": "シリーズ",
    "parts": "パーツ",
    "compatibility": "互換性チェッカー",
    "shipping": "配送情報",
    "about": "当店について",
    "search": "検索",
    "cart": "カート",
    "account": "アカウント"
  },
  "product": {
    "addToCart": "カートに入れる",
    "soldOut": "在庫切れ",
    "preOrder": "予約注文",
    "quantity": "数量",
    "type": "タイプ",
    "blade": "ブレード",
    "ratchet": "ラチェット",
    "bit": "ビット",
    "specifications": "仕様",
    "compatibleWith": "互換性あり",
    "relatedProducts": "おすすめ商品",
    "reviews": "レビュー",
    "shippingEstimate": "{{country}}への配送目安：{{days}}営業日",
    "weight": "重量",
    "series": "シリーズ",
    "productLine": "製品ライン",
    "releaseDate": "発売日",
    "modelNumber": "型番",
    "attack": "アタック",
    "defense": "ディフェンス",
    "stamina": "スタミナ",
    "balance": "バランス"
  },
  "cart": {
    "title": "カート",
    "empty": "カートは空です",
    "continueShopping": "買い物を続ける",
    "subtotal": "小計",
    "shipping": "送料はチェックアウト時に計算されます",
    "checkout": "ご注文手続きへ",
    "remove": "削除",
    "youMightAlsoLike": "セットを完成させよう"
  },
  "search": {
    "placeholder": "ブレード、パーツ、シリーズで検索...",
    "noResults": "「{{query}}」の検索結果はありません",
    "suggestions": "人気の検索",
    "products": "商品",
    "collections": "コレクション",
    "pages": "ページ"
  }
}
```

### 2.6 LocaleSelector Component UX

The locale selector sits in the Header, right-aligned. It is a button showing the current country flag icon + abbreviated locale name (e.g., flag + "US"). On click, it opens a dropdown panel (not a native `<select>` -- that cannot show flags or be styled).

Behavior:
1. **Geo-detection on first visit**: Use `i18next-browser-languagedetector` which reads `navigator.language`. If the browser reports `ko`, route to `/ko`. This happens ONLY on the very first visit (no cookie set). Store the choice in a cookie `locale_preference`.
2. **Dropdown structure**: Two columns on desktop -- left column lists languages, right column lists countries for that language. On mobile, single column stacked. Each option shows: flag icon + country name in native language + currency code.
3. **On selection**: The component builds the new URL by replacing the locale prefix. For example, if the user is at `/fr/products/dran-sword` and selects `ko`, it navigates to `/ko/products/dran-sword`. This is a full navigation (not client-side only) because the server needs to resolve the new locale for API queries.
4. **Accessibility**: The dropdown uses `role="listbox"`, each option `role="option"`, arrow key navigation, Escape to close, focus trap while open.

```tsx
// Pattern for LocaleSelector (component design, not full implementation)
// Button: <button aria-expanded={open} aria-haspopup="listbox">
//   <FlagIcon code={currentLocale.country} /> {currentLocale.country}
//   <ChevronDown />
// </button>
// Panel: absolute positioned, z-50, bg-arena-800 border border-arena-700 rounded-lg shadow-xl
// Each item: flex items-center gap-3 px-4 py-3 hover:bg-arena-700 cursor-pointer
//   <FlagIcon /> <span>{locale.label}</span> <span class="text-arena-400">{locale.currency}</span>
```

---

## Phase 3: Core Pages

### 3.1 Homepage (`($locale)._index.tsx`)

**Section 1: Hero Banner** (full viewport height minus header)
- Full-bleed dark background with subtle animated particle/spark effects (CSS-only using pseudo-elements with `animation: float`)
- Large product image of a flagship Beyblade (e.g., latest UX release) floating center-right with a slow CSS rotation (`animation: spin-slow 8s linear infinite`) on the product image
- Left side: Large heading in Rajdhani Bold -- "UNLEASH THE X" / localized equivalent
- Subheading: "Authentic Beyblade X direct from Japan"
- Two CTAs: "Shop New Arrivals" (accent button) and "Explore Series" (secondary button)
- Below the hero fold, a thin animated gradient bar in the four type colors (blue -> green -> orange -> red) scrolling left continuously -- this is a subtle branding element

**Section 2: Featured Collection Carousel** (py-16)
- Heading: "New Arrivals" or "Featured Products"
- Horizontal scrollable row using Swiper with 2 cards visible on mobile, 3 on tablet, 4-5 on desktop
- Each card: ProductCard component (described below)
- Navigation arrows on desktop, swipe on mobile
- GraphQL: Query `collection(handle: "new-arrivals")` with first 12 products

**Section 3: Shop By Type** (py-16, bg-arena-900)
- Four large cards in a 2x2 grid (mobile) or 4-column row (desktop)
- Each card represents a Beyblade type with its color as the dominant accent:
  - **Attack** (blue card): Bolt/lightning icon, link to `/collections/attack-type`
  - **Defense** (green card): Shield icon, link to `/collections/defense-type`
  - **Stamina** (orange card): Hourglass/infinity icon, link to `/collections/stamina-type`
  - **Balance** (red card): Yin-yang/scale icon, link to `/collections/balance-type`
- Each card has a dark background with a colored gradient border, the type icon, type name, and a brief description
- On hover: the card border glows with the type color using the `pulse-glow` animation variant

**Section 4: Shop By Series** (py-16)
- Horizontal scrollable pills/tabs showing series: "BX Basic Line", "UX Unique Line", "CX Custom Line", "Accessories", "Launchers", "Stadiums"
- Below the tabs, a 3-column grid (desktop) showing 6 products from the selected series
- Default selected: the newest series
- Clicking a tab fetches that collection client-side (or use prefetched data)

**Section 5: Why Shop With Us** (py-16, bg-arena-900)
- 4-column grid of trust badges:
  - "100% Authentic Takara Tomy" -- shield icon
  - "Direct from Japan" -- Japan flag + airplane icon
  - "Worldwide Shipping" -- globe icon
  - "Expert Support" -- chat icon
- Each has an icon, title, and 1-line description

**Section 6: Shipping Info Banner** (py-12)
- A visually distinct banner with a world map illustration
- "We ship to 50+ countries from Tokyo, Japan"
- Three columns: "Fast Shipping (3-7 days EMS)", "Tracked & Insured", "Easy Returns"
- CTA: "See Shipping Rates" linking to shipping info page

**Section 7: Newsletter Signup** (py-16)
- Dark card with gradient border
- "Stay Updated on New Releases"
- Email input + subscribe button
- Small text: "Join 10,000+ Bladers worldwide"

**Homepage Loader**:
```ts
export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const [{collection: featured}, {collection: newArrivals}] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: {handle: 'featured', country: storefront.i18n.country, language: storefront.i18n.language},
    }),
    storefront.query(COLLECTION_QUERY, {
      variables: {handle: 'new-arrivals', first: 12, country: storefront.i18n.country, language: storefront.i18n.language},
    }),
  ]);

  return {featured, newArrivals};
}
```

### 3.2 Collection Page (`($locale).collections.$handle.tsx`)

**Layout**:
- Breadcrumbs at top: Home > Collections > [Collection Name]
- Collection title + description (from Shopify) in a hero-like header area
- If the collection is a type collection (attack/defense/stamina/balance), show the type badge color as the header accent

**Filters sidebar** (desktop: left sidebar 280px, mobile: bottom sheet triggered by "Filter" button):
- **Product Type**: Checkboxes -- Starter, Booster, Random Booster, Set, Parts, Launcher, Stadium, Accessory
- **Beyblade Type**: Attack, Defense, Stamina, Balance (with colored dots)
- **Series**: BX, UX, CX
- **Price Range**: Slider or preset ranges ($0-$20, $20-$50, $50-$100, $100+) -- amounts localized to current currency
- **Availability**: In Stock, Pre-Order, Coming Soon
- **Sort**: Newest, Price Low-High, Price High-Low, Best Selling, Alphabetical

Filters use Shopify's `collection.products` with `filters` argument in the Storefront API. The filter values map to product tags and metafields.

**Grid**:
- Mobile (< 640px): 2 columns, gap-3
- Tablet (640px-1024px): 3 columns, gap-4
- Desktop (> 1024px): 4 columns (with sidebar) or 5 columns (without sidebar), gap-6

**Pagination**: Cursor-based using Shopify's `Pagination` component from `@shopify/hydrogen`. Load 24 products per page. "Load More" button at bottom (not infinite scroll -- infinite scroll is bad for SEO and causes issues with footer reachability). The URL updates with `?cursor=` for shareable paginated state.

**ProductCard Component**:
```
+---------------------------+
| [Image - aspect-square]   |
| Type badge (top-right)    |  <- Colored pill: "Attack" in blue, etc.
+---------------------------+
| Series tag (small, muted) |  <- "BX Basic Line"
| Product Title             |  <- Rajdhani semibold, line-clamp-2
| Model number (muted)      |  <- "BX-01"
| Price                     |  <- Bold, with compareAt strikethrough if on sale
| [Quick Add button]        |  <- Only for single-variant products
+---------------------------+
```

On hover: image scales to 1.05, a second image (if available) crossfades in. The card border gets a subtle type-color glow.

### 3.3 Product Detail Page (`($locale).products.$handle.tsx`)

**Full Layout Specification**:

```
Desktop (>1024px):
+--------------------------------------------------+
| Breadcrumbs: Home > Series > Product Name        |
+--------------------------------------------------+
| LEFT (55%)          | RIGHT (45%)                |
|                     |                            |
| [Main Image]        | Series badge               |
| 580px max, zoomable | Product Title (heading-xl)  |
|                     | Model: BX-01               |
| Thumbnail strip     | Type: [Attack badge]       |
| (horizontal, 5 vis) |                            |
|                     | Price: $29.99              |
|                     | compareAt: $34.99 (if any) |
|                     |                            |
|                     | --- Variant Selector ---   |
|                     | (if variants exist)        |
|                     |                            |
|                     | Quantity: [- 1 +]          |
|                     |                            |
|                     | [ADD TO CART] (accent btn) |
|                     | [BUY NOW]    (primary btn) |
|                     |                            |
|                     | Shipping estimate:         |
|                     | "5-7 days to US via EMS"   |
|                     |                            |
|                     | Trust badges row:          |
|                     | Authentic | Tracked | Safe |
+--------------------------------------------------+
| TABS below fold:                                 |
| [Description] [Specifications] [Compatibility]   |
|                                                  |
| Description tab: HTML from Shopify descriptionHtml|
|                                                  |
| Specifications tab:                              |
| Blade: Dran Sword                                |
| Ratchet: 3-60                                    |
| Bit: F (Flat)                                    |
| Type: Attack                                     |
| Weight: 32g                                      |
| Release Date: 2023-06-10                         |
| Model Number: BX-01                              |
|                                                  |
| Compatibility tab:                               |
| "This blade is compatible with:"                 |
| [Grid of compatible ratchets and bits]           |
+--------------------------------------------------+
| Related Products carousel (8 products)           |
+--------------------------------------------------+
```

**Image Gallery Behavior**:
- Main image: Displays the selected variant's image or first product image
- Click on main image: Opens react-medium-image-zoom inline zoom (not a modal -- keeps the user on page)
- Thumbnail strip below on desktop, swipeable carousel on mobile
- Mobile: Full-width swipeable gallery (Swiper) with pagination dots, no thumbnails
- Images are loaded via Shopify's CDN with width parameter: main image at 1200px, thumbnails at 100px, zoom at 2000px

**Variant Selector**:
- For Beyblade starters/boosters, variants are typically color variants or edition variants
- Rendered as clickable swatches (if color) or buttons (if named variants)
- Selected variant has a ring-2 ring-primary-500 border
- Unavailable variants are shown with a diagonal strikethrough line and opacity-50
- Selecting a variant updates the URL search params (`?Color=Blue`) for shareability

**Shipping Estimate on PDP**:
```ts
// app/lib/shipping/estimator.ts
type ShippingEstimate = {
  method: string;
  minDays: number;
  maxDays: number;
  price: string;
  currency: string;
};

export function getShippingEstimate(countryCode: string, weightGrams: number): ShippingEstimate[] {
  const zone = getJapanPostZone(countryCode);
  // Returns array of options: EMS and standard airmail
  // See Phase 5 for full zone/rate data
}
```

**Related Products Algorithm**: Query products from the same collection with the same `beyblade.type` metafield, excluding the current product. Fall back to same-series products if fewer than 4 results. Use `productRecommendations` Storefront API query as a secondary signal.

### 3.4 Cart Implementation

**Cart Drawer** (not a separate page -- better UX for continuing to shop):

The cart is a slide-over drawer from the right side. It is triggered by:
1. Clicking the cart icon in the header
2. After "Add to Cart" action (auto-opens)

**Drawer Layout**:
```
+-----------------------------------+
| YOUR CART (3 items)        [X]    |
+-----------------------------------+
| [img] Dran Sword 3-60F     x     |
|       BX-01 Starter              |
|       $29.99                     |
|       [- 1 +]                    |
+-----------------------------------+
| [img] Hells Scythe 4-60T   x     |
|       BX-02 Starter              |
|       $29.99                     |
|       [- 2 +]                    |
+-----------------------------------+
| COMPLETE YOUR SETUP              |
| [Launcher card] [Stadium card]   |
+-----------------------------------+
| Subtotal:            $89.97      |
| Shipping: Calculated at checkout |
| Duties: May apply for your region|
|                                  |
| [CHECKOUT - $89.97]             |
| [Continue Shopping]              |
+-----------------------------------+
```

**Upsell Strategy** ("Complete Your Setup" section):
- If cart contains only Beyblades (no launcher): suggest the BX-15 Launcher Grip or similar
- If cart contains Beyblades (no stadium): suggest the BX-10 Xtreme Stadium
- If cart total < free shipping threshold: show "Add $X.XX more for free shipping!" with a progress bar
- Upsell products are fetched from a specific collection `upsell-items` and filtered based on what is already in cart

**Cart uses `CartForm` from `@shopify/hydrogen`**:
```tsx
// Pattern for cart line item quantity update
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.LinesUpdate}
  inputs={{lines: [{id: lineId, quantity: newQuantity}]}}
>
  <button type="submit" name="decrease">-</button>
  <span>{quantity}</span>
  <button type="submit" name="increase">+</button>
</CartForm>
```

There is also a `/cart` page route as fallback (for direct URL access and for the checkout button redirect). The page version shows the same data but in a full-page layout.

### 3.5 Search

**Predictive Search** (appears as overlay when typing in header search input):

The search input is in the header. On focus + typing (debounced 300ms), a dropdown appears below the input showing results in categorized sections:

```
+---------------------------------------+
| [Search input: "dran"]                |
+---------------------------------------+
| PRODUCTS                              |
| [img] Dran Sword 3-60F  -  $29.99   |
| [img] Dran Buster 1-60A -  $34.99   |
| [img] Dran Dagger 4-60R -  $29.99   |
|                                       |
| COLLECTIONS                           |
| Dran Series                           |
|                                       |
| View all results for "dran" ->        |
+---------------------------------------+
```

**Implementation**: Uses the Storefront API `predictiveSearch` query:

```graphql
query PredictiveSearch(
  $query: String!
  $limit: Int!
  $limitScope: PredictiveSearchLimitScope!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  predictiveSearch(
    query: $query
    limit: $limit
    limitScope: $limitScope
    types: [PRODUCT, COLLECTION, PAGE]
  ) {
    products {
      id
      title
      handle
      productType
      variants(first: 1) {
        nodes {
          price { amount currencyCode }
          image { url altText width height }
        }
      }
    }
    collections {
      id
      title
      handle
    }
    pages {
      id
      title
      handle
    }
  }
}
```

**CJK text handling**: Japanese and Korean text does not use spaces between words, so the search query is sent as-is to the Storefront API which handles tokenization. The input has `inputMode="search"` and `enterKeyHint="search"` attributes for mobile keyboards. The debounce is increased to 500ms for CJK input methods (detected by checking if the composition event is active via `onCompositionStart`/`onCompositionEnd` handlers) because IME composition creates intermediate states that should not trigger searches.

**Full Search Results Page** (`($locale).search.tsx`):
- URL: `/search?q=dran+sword`
- Uses the `search` query from Storefront API (not predictiveSearch)
- Results displayed in same grid as collection page (2/3/4 columns)
- Filters on the left sidebar: Product Type, Beyblade Type, Price Range
- Pagination: same cursor-based "Load More" pattern

### 3.6 Header

**Desktop Header** (sticky, bg-arena-950/95 backdrop-blur-md):
```
+-------------------------------------------------------------+
| [Announcement Bar: "Free shipping on orders over $100"]     |
+-------------------------------------------------------------+
| [Logo]  Home  Shop  Series▼  Parts▼  Info▼  |  🔍  👤  🛒(3)|
+-------------------------------------------------------------+
```

**Mega Menu for "Series"**:
When hovering/clicking "Series", a full-width dropdown appears:

```
+-------------------------------------------------------------+
| SERIES                                                       |
|                                                              |
| BX BASIC LINE        UX UNIQUE LINE      CX CUSTOM LINE    |
| [img] View All BX    [img] View All UX   [img] View All CX |
| BX-01 to BX-20       UX-01 to UX-18      CX-01 to CX-12   |
| BX-21 to BX-40                                              |
|                                                              |
| FEATURED RELEASE                                             |
| [Large image of newest product with name and CTA]            |
+-------------------------------------------------------------+
```

**Mega Menu for "Parts"**:
```
+-------------------------------------------------------------+
| PARTS                                                        |
|                                                              |
| BLADES              RATCHETS            BITS                 |
| Attack Blades       Standard Ratchets   Flat Bits            |
| Defense Blades      Simple Ratchets     Ball Bits            |
| Stamina Blades                          Needle Bits          |
| Balance Blades                          Disc Bits            |
|                                                              |
| [Compatibility Checker CTA]                                  |
+-------------------------------------------------------------+
```

**Mobile Header**: Hamburger icon on left, logo center, cart icon on right. Hamburger opens a full-screen slide-over from left with accordion navigation. Search is a full-width bar at the top of the mobile menu.

### 3.7 Footer

Four-column layout on desktop, stacked on mobile:

**Column 1: Shop**
- All Products
- New Arrivals
- Best Sellers
- BX Basic Line
- UX Unique Line
- Launchers & Accessories
- Stadiums

**Column 2: Information**
- About Us
- Shipping & Delivery
- Return Policy
- FAQ
- Compatibility Guide
- Contact Us

**Column 3: Follow Us**
- Instagram
- YouTube
- X (Twitter)
- TikTok
- Discord (community link)

**Column 4: Newsletter**
- "Get notified about new Beyblade releases"
- Email input + subscribe button

**Bottom bar**: Copyright, locale selector (duplicate), payment icons (Visa, Mastercard, PayPal, Apple Pay, Google Pay), "Beyblade is a trademark of Takara Tomy" disclaimer.

---

## Phase 4: Beyblade-Specific Features

### 4.1 Complete Metafield Schema

All metafields use the `beyblade` namespace. These are configured in the Shopify Admin under Settings > Custom data > Products.

| namespace.key | Type | Description | Example Value |
|---|---|---|---|
| `beyblade.type` | `single_line_text_field` | Attack, Defense, Stamina, or Balance | `"Attack"` |
| `beyblade.blade_name` | `single_line_text_field` | Name of the blade component | `"Dran Sword"` |
| `beyblade.ratchet_spec` | `single_line_text_field` | Ratchet specification | `"3-60"` |
| `beyblade.bit_spec` | `single_line_text_field` | Bit specification | `"F"` |
| `beyblade.bit_full_name` | `single_line_text_field` | Full bit name | `"Flat"` |
| `beyblade.series` | `single_line_text_field` | Product series | `"BX Basic Line"` |
| `beyblade.product_line` | `single_line_text_field` | BX, UX, or CX | `"BX"` |
| `beyblade.model_number` | `single_line_text_field` | Official model code | `"BX-01"` |
| `beyblade.weight_grams` | `number_integer` | Weight in grams | `32` |
| `beyblade.release_date` | `date` | Japan release date | `"2023-06-10"` |
| `beyblade.spin_direction` | `single_line_text_field` | Right or Left | `"Right"` |
| `beyblade.ratchet_type` | `single_line_text_field` | Standard or Simple | `"Standard"` |
| `beyblade.product_contents` | `json` | What comes in the box | `["Blade", "Ratchet", "Bit", "Launcher"]` |
| `beyblade.compatible_blades` | `list.single_line_text_field` | Compatible blade names | `["Dran Sword", "Hells Scythe", ...]` |
| `beyblade.compatible_ratchets` | `list.single_line_text_field` | Compatible ratchet specs | `["3-60", "4-80", "1-60", ...]` |
| `beyblade.compatible_bits` | `list.single_line_text_field` | Compatible bit specs | `["F", "T", "B", "N", ...]` |
| `beyblade.is_limited_edition` | `boolean` | Limited/exclusive release | `true` |
| `beyblade.stadium_type` | `single_line_text_field` | For stadium products | `"Xtreme"` |

### 4.2 Parts Compatibility Checker

A dedicated page (`($locale).pages.compatibility.tsx`) and an inline tab on PDPs.

**How it works**:
1. User selects a blade from a dropdown (populated from products with `beyblade.product_line` metafield values)
2. System reads the `compatible_ratchets` and `compatible_bits` metafields for that blade
3. Displays a grid showing which ratchets and bits are compatible
4. Each compatible part links to its product page if sold individually
5. Incompatible combinations are shown greyed out with a tooltip explaining why

**Data architecture**: The compatibility data lives in metafields on each product. When the blade is a product, its `compatible_ratchets` list metafield contains strings like `["3-60", "4-80", "1-60"]`. The page queries all products with the `parts` tag and cross-references.

For the PDP inline compatibility tab, the data is already loaded from the product query (see the metafield aliases in the PRODUCT_QUERY above). No additional API call needed.

**Visual presentation**: A matrix table where rows are ratchets and columns are bits. Cells are colored green (compatible) or grey (incompatible). Clicking a green cell adds that specific combo to a "My Build" sidebar that can be added to cart as a bundle.

### 4.3 Collection Hierarchy

```
All Products (handle: "all")
|
+-- By Type
|   +-- Attack Type (handle: "attack-type")
|   +-- Defense Type (handle: "defense-type")
|   +-- Stamina Type (handle: "stamina-type")
|   +-- Balance Type (handle: "balance-type")
|
+-- By Series / Product Line
|   +-- BX Basic Line (handle: "bx-basic-line")
|   |   +-- BX Starters (handle: "bx-starters")
|   |   +-- BX Boosters (handle: "bx-boosters")
|   |   +-- BX Random Boosters (handle: "bx-random-boosters")
|   |   +-- BX Sets (handle: "bx-sets")
|   +-- UX Unique Line (handle: "ux-unique-line")
|   |   +-- UX Starters (handle: "ux-starters")
|   |   +-- UX Boosters (handle: "ux-boosters")
|   |   +-- UX Sets (handle: "ux-sets")
|   +-- CX Custom Line (handle: "cx-custom-line")
|
+-- By Part Type
|   +-- Blades (handle: "blades")
|   +-- Ratchets (handle: "ratchets")
|   +-- Bits (handle: "bits")
|
+-- Accessories
|   +-- Launchers (handle: "launchers")
|   +-- Launcher Grips (handle: "launcher-grips")
|   +-- Stadiums (handle: "stadiums")
|   +-- Storage & Cases (handle: "storage-cases")
|
+-- Special
|   +-- New Arrivals (handle: "new-arrivals")
|   +-- Best Sellers (handle: "best-sellers")
|   +-- Limited Edition (handle: "limited-edition")
|   +-- Pre-Orders (handle: "pre-orders")
|   +-- Sale (handle: "sale")
|   +-- Upsell Items (handle: "upsell-items")  -- hidden, used for cart upsells
```

### 4.4 Type Badge Visual Differentiation

The `TypeBadge` component displays the Beyblade type with its official color:

```tsx
// Design spec for TypeBadge
// Attack:  bg-bey-attack/20  text-bey-attack  border-bey-attack/40  icon: bolt
// Defense: bg-bey-defense/20 text-bey-defense border-bey-defense/40 icon: shield
// Stamina: bg-bey-stamina/20 text-bey-stamina border-bey-stamina/40 icon: flame
// Balance: bg-bey-balance/20 text-bey-balance border-bey-balance/40 icon: scale

// Rendered as:
// <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
//   bg-bey-attack/20 text-bey-attack border border-bey-attack/40">
//   <BoltIcon class="w-3.5 h-3.5" />
//   Attack
// </span>
```

On collection pages, the type colors are also used as:
- Thin left border on product cards (`border-l-4 border-bey-attack`)
- Background gradient on collection page headers (faded, e.g., `bg-gradient-to-r from-bey-attack/10 to-transparent`)

---

## Phase 5: Shipping

### 5.1 Japan Post Rate Configuration

```ts
// app/lib/shipping/zones.ts

// Japan Post EMS zones (as of January 2026)
export const JAPAN_POST_ZONES: Record<string, number> = {
  // Zone 1: East Asia
  KR: 1, CN: 1, TW: 1, HK: 1, MO: 1,
  // Zone 2: Southeast Asia, South Asia, Oceania
  MY: 2, SG: 2, TH: 2, ID: 2, PH: 2, VN: 2, IN: 2, AU: 2, NZ: 2,
  // Zone 3: North America, Europe, Middle East
  US: 3, CA: 3, MX: 3, GB: 3, FR: 3, DE: 3, IT: 3, ES: 3,
  // Zone 4: South America, Africa
  BR: 4, AR: 4, CL: 4, ZA: 4,
};

// Approximate EMS rates in JPY (January 2026 schedule)
// These are approximate -- actual rates from Japan Post PDF schedule
export const EMS_RATES_JPY: Record<number, Record<string, number>> = {
  // zone: { maxWeightGrams: priceJPY }
  1: {
    '500':  1450,
    '600':  1580,
    '700':  1710,
    '800':  1840,
    '900':  1970,
    '1000': 2100,
    '1250': 2400,
    '1500': 2700,
    '1750': 3000,
    '2000': 3300,
  },
  2: {
    '500':  2150,
    '600':  2350,
    '700':  2550,
    '800':  2750,
    '900':  2950,
    '1000': 3150,
    '1250': 3600,
    '1500': 4050,
    '1750': 4500,
    '2000': 4950,
  },
  3: {
    '500':  3150,
    '600':  3450,
    '700':  3750,
    '800':  4050,
    '900':  4350,
    '1000': 4650,
    '1250': 5350,
    '1500': 6050,
    '1750': 6750,
    '2000': 7450,
  },
  4: {
    '500':  3900,
    '600':  4300,
    '700':  4700,
    '800':  5100,
    '900':  5500,
    '1000': 5900,
    '1250': 6800,
    '1500': 7700,
    '1750': 8600,
    '2000': 9500,
  },
};

// Estimated delivery days from Japan
export const EMS_DELIVERY_DAYS: Record<number, [number, number]> = {
  1: [2, 4],    // Korea, China, Taiwan: 2-4 business days
  2: [3, 7],    // SE Asia, Oceania: 3-7 business days
  3: [4, 8],    // North America, Europe: 4-8 business days
  4: [5, 12],   // South America, Africa: 5-12 business days
};

// Cheaper alternative: Small Packet (Airmail) for items under 2kg
export const SMALL_PACKET_RATES_JPY: Record<number, Record<string, number>> = {
  1: { '100': 510, '200': 670, '300': 830, '500': 1150, '1000': 1900, '2000': 3400 },
  2: { '100': 610, '200': 820, '300': 1030, '500': 1450, '1000': 2500, '2000': 4600 },
  3: { '100': 810, '200': 1110, '300': 1410, '500': 2010, '1000': 3510, '2000': 6510 },
  4: { '100': 810, '200': 1110, '300': 1410, '500': 2010, '1000': 3510, '2000': 6510 },
};

export const SMALL_PACKET_DELIVERY_DAYS: Record<number, [number, number]> = {
  1: [5, 10],
  2: [7, 14],
  3: [7, 21],
  4: [14, 30],
};
```

### 5.2 Shipping Estimate Display on Product Page

The `ShippingEstimate` component reads the user's detected country from the locale context:

```tsx
// Rendering pattern:
// ┌────────────────────────────────────────┐
// │ 🚀 Ships from Tokyo, Japan            │
// │                                        │
// │ EMS Express:          4-8 business days│
// │ Estimated: ~$32 USD                    │
// │                                        │
// │ Airmail (economy):    7-21 days        │
// │ Estimated: ~$18 USD                    │
// │                                        │
// │ ℹ️ Import duties may apply             │
// └────────────────────────────────────────┘
```

The JPY rates are converted to the user's currency using a daily exchange rate fetched from Shopify Markets (available in the storefront context). If exact conversion is not available, show "approximately" with a disclaimer.

### 5.3 Customs/Duties Information Per Country

```ts
// app/lib/shipping/duties.ts

export const DUTIES_INFO: Record<string, {
  threshold: string;        // De minimis threshold in local currency
  typicalRate: string;      // Typical duty rate range
  vatGst: string;           // VAT/GST info
  note: string;
}> = {
  US: {
    threshold: '$800 USD',
    typicalRate: '0-6%',
    vatGst: 'No federal sales tax on imports under $800',
    note: 'Most Beyblade orders fall under the $800 de minimis threshold and will not incur duties.',
  },
  CA: {
    threshold: '$20 CAD',
    typicalRate: '0-8%',
    vatGst: '5% GST + provincial tax may apply',
    note: 'Orders over $20 CAD may be subject to GST/HST and customs duties.',
  },
  GB: {
    threshold: '£135 GBP',
    typicalRate: '0-6.5%',
    vatGst: '20% VAT applies on all imports',
    note: 'VAT is charged on all goods imported into the UK regardless of value.',
  },
  FR: {
    threshold: '€150 EUR',
    typicalRate: '0-6.5%',
    vatGst: '20% TVA applies on all imports',
    note: 'TVA (VAT) is applied to all imports. Customs duties apply above €150.',
  },
  KR: {
    threshold: '$150 USD equivalent',
    typicalRate: '8%',
    vatGst: '10% VAT on all imports',
    note: 'Personal-use imports under $150 USD may be exempt from customs duty, but VAT still applies.',
  },
  BR: {
    threshold: '$50 USD',
    typicalRate: '60%',
    vatGst: 'ICMS (state tax) ~17-25%',
    note: 'Brazil has high import duties. Orders may be subject to 60% import tax plus state ICMS tax.',
  },
  AU: {
    threshold: '$1000 AUD',
    typicalRate: '0-5%',
    vatGst: '10% GST on all imports',
    note: 'GST is collected at point of sale for orders under $1000 AUD. Duties apply above that threshold.',
  },
  MY: {
    threshold: 'RM500',
    typicalRate: '0-10%',
    vatGst: 'SST may apply',
    note: 'Imports under RM500 are generally exempt from duties.',
  },
};
```

### 5.4 Shipping Info Page Content

The `/pages/shipping` route contains a static content page organized as:

1. **Shipping Methods Table** -- EMS vs Airmail comparison with rates and timeframes per region
2. **How We Pack** -- Photos of packaging process, emphasis on protective packaging for collectibles
3. **Tracking** -- "All EMS orders include tracking. You will receive a tracking number via email within 24 hours of shipping."
4. **Customs & Duties** -- Per-country accordion showing the data from `DUTIES_INFO`
5. **Delivery Delays** -- Disclaimer about customs processing times, national holidays in Japan (Golden Week, New Year)
6. **Free Shipping** -- "Orders over $100 USD (or equivalent) qualify for free EMS shipping"
7. **FAQ** -- Common questions about international shipping from Japan

---

## Phase 6: SEO

### 6.1 Hreflang Implementation

In `root.tsx`, generate hreflang link tags for every supported locale. The pattern uses `getSeoMeta` from `@shopify/hydrogen`:

```tsx
// In root.tsx meta function
export function meta({data, location}: MetaFunctionArgs) {
  const seoMeta = getSeoMeta({
    title: data.shop.name,
    description: data.shop.description,
    alternates: Object.values(SUPPORTED_LOCALES).map((locale) => ({
      url: buildLocalizedUrl(location.pathname, locale),
      language: locale.hreflang,
    })),
  });

  return seoMeta;
}
```

This generates:
```html
<link rel="alternate" hreflang="en-us" href="https://beybladestore.com/products/dran-sword" />
<link rel="alternate" hreflang="fr-fr" href="https://beybladestore.com/fr/products/dran-sword" />
<link rel="alternate" hreflang="ko-kr" href="https://beybladestore.com/ko/products/dran-sword" />
<link rel="alternate" hreflang="pt-br" href="https://beybladestore.com/pt-br/products/dran-sword" />
<link rel="alternate" hreflang="ms-my" href="https://beybladestore.com/ms/products/dran-sword" />
<link rel="alternate" hreflang="ja-jp" href="https://beybladestore.com/ja/products/dran-sword" />
<link rel="alternate" hreflang="en-ca" href="https://beybladestore.com/en-ca/products/dran-sword" />
<link rel="alternate" hreflang="en-gb" href="https://beybladestore.com/en-gb/products/dran-sword" />
<link rel="alternate" hreflang="en-au" href="https://beybladestore.com/en-au/products/dran-sword" />
<link rel="alternate" hreflang="x-default" href="https://beybladestore.com/products/dran-sword" />
```

### 6.2 JSON-LD Product Schema

```tsx
// app/components/seo/JsonLd.tsx

import type {Product as SchemaProduct, WithContext} from 'schema-dts';

export function productToJsonLd(product: any, locale: Locale, url: string): WithContext<SchemaProduct> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((img: any) => img.url),
    url: url,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Takara Tomy',
    },
    sku: product.variants.nodes[0]?.sku || product.modelNumber?.value,
    mpn: product.modelNumber?.value,
    category: `Toys > Spinning Tops > Beyblade > ${product.beybladeType?.value || 'General'}`,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.variants.nodes.some((v: any) => v.availableForSale)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Beyblade Store',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingOrigin: {
          '@type': 'DefinedRegion',
          addressCountry: 'JP',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 10,
            unitCode: 'DAY',
          },
        },
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Beyblade Type',
        value: product.beybladeType?.value,
      },
      {
        '@type': 'PropertyValue',
        name: 'Blade',
        value: product.bladeName?.value,
      },
      {
        '@type': 'PropertyValue',
        name: 'Ratchet',
        value: product.ratchetSpec?.value,
      },
      {
        '@type': 'PropertyValue',
        name: 'Bit',
        value: product.bitSpec?.value,
      },
    ],
  };
}
```

This is injected into the route meta via `getSeoMeta`:

```ts
export function meta({data}: MetaFunctionArgs) {
  const {product} = data;
  return getSeoMeta({
    title: `${product.title} | Beyblade Store`,
    description: product.seo.description || product.description?.substring(0, 160),
    jsonLd: productToJsonLd(product, locale, url),
  });
}
```

### 6.3 Sitemap Generation

The `[sitemap.xml].tsx` route generates a dynamic XML sitemap. It queries all products, collections, and pages from the Storefront API and generates URLs for each locale:

```ts
// Key pattern in [sitemap.xml].tsx loader:
// For each product, generate URLs for all locales:
// <url>
//   <loc>https://beybladestore.com/products/dran-sword</loc>
//   <xhtml:link rel="alternate" hreflang="en-us" href="https://beybladestore.com/products/dran-sword"/>
//   <xhtml:link rel="alternate" hreflang="fr-fr" href="https://beybladestore.com/fr/products/dran-sword"/>
//   ...
//   <lastmod>2026-03-15</lastmod>
//   <changefreq>weekly</changefreq>
// </url>
```

For stores with 250+ products, split into multiple sitemaps using a sitemap index (`[sitemap-index.xml].tsx`) pointing to `/sitemap-products.xml`, `/sitemap-collections.xml`, `/sitemap-pages.xml`.

### 6.4 Meta Tag Strategy Per Page Type

| Page | Title Pattern | Description | OG Image |
|---|---|---|---|
| Homepage | `Beyblade Store - Authentic Beyblade X from Japan` | Store description | Hero banner image |
| Collection | `{Collection} - Beyblade Store` | Collection description, truncated 160 chars | First product image from collection |
| Product | `{Product Title} - {Model} | Beyblade Store` | `{Type} type Beyblade. {Blade} blade with {Ratchet} ratchet and {Bit} bit.` | Product's first image |
| Search | `Search: {query} | Beyblade Store` | `Search results for "{query}" at Beyblade Store` | Store logo |
| Page | `{Page Title} | Beyblade Store` | Page excerpt | Store logo |

### 6.5 Open Graph Image Strategy

Product images from Shopify's CDN can be resized via URL parameters. For OG images, request 1200x630 crop:

```ts
function getOgImageUrl(imageUrl: string): string {
  // Shopify CDN supports _1200x630_crop_center format
  return imageUrl.replace(/\.(\w+)(\?.*)?$/, '_1200x630_crop_center.$1');
}
```

For products where the image aspect ratio doesn't suit 1200x630, consider generating OG images server-side using a template that overlays the product image on a branded dark background with the product name and type badge. This can be done with a Cloudflare Worker or a simple canvas-based generator.

---

## Phase 7: Deployment

### 7.1 Oxygen Deployment

```bash
# Link the project to your Shopify store
npx shopify hydrogen link

# Set up environment (creates preview + production environments in Shopify admin)
npx shopify hydrogen setup

# Deploy to production
npx shopify hydrogen deploy
```

Deployments are triggered automatically via GitHub integration (recommended) or manually via CLI. Set up the GitHub integration in Shopify Admin > Hydrogen > your storefront > Environments.

### 7.2 Environment Variables

Set these in Shopify Admin > Hydrogen > Environments:

| Variable | Purpose | Example |
|---|---|---|
| `SESSION_SECRET` | Cookie signing secret | `a1b2c3d4e5...` (random 64 chars) |
| `PUBLIC_STOREFRONT_API_TOKEN` | Storefront API public token | `shp_abc123...` |
| `PRIVATE_STOREFRONT_API_TOKEN` | Storefront API private token (server-side) | `shpat_xyz789...` |
| `PUBLIC_STORE_DOMAIN` | Store domain | `beyblade-store.myshopify.com` |
| `PUBLIC_STOREFRONT_API_VERSION` | API version | `2025-07` |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Customer accounts | (from Shopify admin) |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | Customer accounts endpoint | `https://shopify.com/...` |

Important: `import.meta.env` does NOT work on Oxygen. All env vars must be accessed via the `context.env` object passed through loaders and server functions.

### 7.3 Domain Setup

1. Purchase domain (e.g., `beybladestore.com` or `beybladejapan.com`)
2. In Shopify Admin > Settings > Domains, add the custom domain
3. In Hydrogen storefront settings, assign the domain to the production environment
4. Shopify provisions an SSL certificate automatically
5. Set DNS: CNAME record pointing to `shops.myshopify.com` (or the Oxygen-provided domain)

### 7.4 Post-Launch Monitoring Checklist

- Verify Shopify Analytics Live View shows traffic
- Check Google Search Console for indexing status, submit sitemap
- Verify hreflang tags render correctly per locale (use hreflang.org checker)
- Test checkout flow in each target currency (place test orders)
- Monitor Oxygen deployment logs for errors (Shopify Admin > Hydrogen > Logs)
- Set up Shopify Flow for low stock alerts on popular items
- Test Japan Post tracking number integration
- Verify email notifications are localized
- Performance: target Web Vitals -- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Run Lighthouse CI on key pages: homepage, PDP, collection

---

## Cross-Cutting Concerns

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|---|---|---|
| `xs` | 475px | Large phones |
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops, landscape tablets |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Page adaptations**:
- **Header**: Below `lg`, collapses to hamburger. Search moves into mobile menu.
- **Product grid**: 2 cols (`xs`-`sm`), 3 cols (`md`), 4 cols (`lg`+)
- **PDP**: Below `lg`, stacks to single column (gallery on top, info below). Gallery becomes horizontal swiper.
- **Cart drawer**: Full width below `sm`, 420px fixed width above `sm`.
- **Mega menu**: Below `lg`, becomes accordion in mobile nav drawer.
- **Footer**: 4 cols at `lg`+, 2 cols at `sm`-`md`, 1 col stacked below `sm`.

### Loading States and Skeletons

Every page has a corresponding skeleton. Pattern:

```tsx
// app/components/common/Skeleton.tsx
// ProductCard skeleton:
// <div class="animate-shimmer bg-gradient-to-r from-arena-800 via-arena-700 to-arena-800
//   bg-[length:200%_100%] rounded-lg">
//   <div class="aspect-square rounded-t-lg bg-arena-700" />  <!-- image placeholder -->
//   <div class="p-4 space-y-2">
//     <div class="h-3 w-16 bg-arena-700 rounded" />         <!-- series tag -->
//     <div class="h-5 w-3/4 bg-arena-700 rounded" />        <!-- title -->
//     <div class="h-4 w-1/4 bg-arena-700 rounded" />        <!-- price -->
//   </div>
// </div>
```

Specific loading states:
- **Homepage**: Hero skeleton (large rect + text lines), product card grid of 4-8 skeleton cards
- **Collection**: Skeleton grid matching the expected column count
- **PDP**: Large image skeleton left, text line skeletons right
- **Cart drawer**: Line item skeletons (image rect + text)
- **Search**: Skeleton result rows

### Error States

```tsx
// app/components/common/ErrorBoundary.tsx
// Pattern for route-level error boundary:

// 404 (product/collection not found):
// Dark card centered on page
// Large "404" in Rajdhani display font
// "This Beyblade has left the stadium"
// "The page you're looking for doesn't exist or has been moved."
// [Back to Home] [Browse All Products]

// 500 (server error):
// "Something went wrong"
// "We're having trouble loading this page. Please try again."
// [Retry] [Back to Home]

// Network error (offline/timeout):
// "Connection lost"
// "Please check your internet connection and try again."
// [Retry]

// Cart error (failed to add):
// Inline toast notification at top of page, red background
// "Failed to add item to cart. Please try again."
// Auto-dismiss after 5 seconds
```

Each route exports an `ErrorBoundary` component that catches errors from loaders and renders the appropriate state. The error boundary checks `isRouteErrorResponse(error)` to differentiate 404 from 500 errors.

### Accessibility Requirements

| Component | Requirements |
|---|---|
| **All interactive elements** | Minimum 44x44px touch target, visible focus ring (`ring-2 ring-primary-500 ring-offset-2 ring-offset-arena-950`) |
| **Images** | All product images have `alt` text from Shopify (or product title as fallback). Decorative images use `alt=""` `role="presentation"` |
| **Type badges** | Not color-only: each type has both color AND icon AND text label |
| **Mega menu** | `role="navigation"`, `aria-label="Main navigation"`, arrow key navigation between top-level items, Escape closes dropdown |
| **Cart drawer** | `role="dialog"`, `aria-modal="true"`, `aria-label="Shopping cart"`, focus trapped inside, Escape closes |
| **Locale selector** | `role="listbox"`, `aria-activedescendant` tracks current selection, arrow keys navigate |
| **Product gallery** | Thumbnails are `role="tablist"`, each thumbnail `role="tab"`, main image `role="tabpanel"`. Arrow keys cycle images. |
| **Quantity selector** | `role="spinbutton"`, `aria-valuemin="1"`, `aria-valuemax="99"`, `aria-valuenow={quantity}` |
| **Price display** | Use `<data value="29.99">` for machine-readable price, screen reader text includes currency name ("29 dollars and 99 cents") |
| **Skip to content** | Hidden link at very top of page that becomes visible on focus: "Skip to main content" |
| **Language** | `<html lang="en">` updated per locale. Japanese pages use `lang="ja"`, Korean `lang="ko"`, etc. |
| **Color contrast** | All text on arena-900/950 backgrounds meets WCAG AA. Primary text: white (21:1). Secondary text: arena-300 (#b4b4c5) on arena-950 (#0d0d1a) = 7.5:1. Passes AA. |

---

## Implementation Sequencing

**Week 1**: Scaffold project, configure Tailwind theme, set up locale routing infrastructure, create the layout shell (Header with static links, Footer, root.tsx with analytics provider).

**Week 2**: Build design system components (Button, Badge, TypeBadge, ProductCard, Skeleton, Container, Breadcrumbs). Build LocaleSelector. Complete all translation files.

**Week 3**: Homepage (all 7 sections), collection page with filters and pagination, product detail page with all tabs and metafield display.

**Week 4**: Cart drawer, search (predictive + full results), shipping estimator, compatibility checker page.

**Week 5**: SEO (JSON-LD, hreflang, sitemap, meta tags), error boundaries, loading states, accessibility audit.

**Week 6**: QA across all locales and currencies, performance optimization (image lazy loading, code splitting, prefetching), deploy to Oxygen staging, test checkout flows.

**Week 7**: Production deployment, domain setup, Google Search Console submission, monitoring setup.

---

### Critical Files for Implementation

- `C:/Users/k3n70/desktop/shopify/beyblade-store/app/lib/i18n/locales.ts` -- The locale configuration file is the foundation for all i18n routing, API context, currency display, and hreflang generation; every other file depends on its types and data.
- `C:/Users/k3n70/desktop/shopify/beyblade-store/app/routes/($locale).products.$handle.tsx` -- The product detail page route is the most complex single file, containing the full Storefront API query with all Beyblade metafield aliases, the @inContext pattern, variant selection logic, and JSON-LD generation.
- `C:/Users/k3n70/desktop/shopify/beyblade-store/tailwind.config.ts` -- The design system definition including all Beyblade brand colors, type colors, arena dark theme, custom fonts, and animation keyframes that every component references.
- `C:/Users/k3n70/desktop/shopify/beyblade-store/server.ts` -- The server entry point where locale is resolved from the URL, the storefront client is created with i18n context, and environment variables are accessed (Oxygen does not support import.meta.env).
- `C:/Users/k3n70/desktop/shopify/beyblade-store/app/lib/shipping/zones.ts` -- The shipping rate and zone configuration file that powers the shipping estimator on PDPs, the cart shipping preview, and the shipping info page content.

Sources:
- [Shopify Hydrogen Fundamentals](https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals)
- [Setup multilingual storefronts with URL paths](https://shopify.dev/docs/storefronts/headless/hydrogen/markets/multiple-languages-url-paths)
- [Internationalization with Shopify Markets](https://shopify.dev/docs/storefronts/headless/hydrogen/markets)
- [CartForm Documentation](https://shopify.dev/docs/api/hydrogen/latest/components/cartform)
- [getSeoMeta Utility](https://shopify.dev/docs/api/hydrogen/latest/utilities/getseometa)
- [Hydrogen Skeleton Template](https://github.com/Shopify/hydrogen/tree/main/templates/skeleton)
- [Beyblade X Parts Database](https://www.beybxdb.com/parts-system-guide/parts)
- [Beyblade X Types Guide](https://www.thegamer.com/beyblade-x-beyblade-types-guide/)
- [Japan Post EMS Rate Schedule](https://www.post.japanpost.jp/int/charge/list/ems_all_en.html)
- [Japan Post International Mail Rates 2026](https://www.post.japanpost.jp/int/download/charges_en.pdf)
- [Shopify Hydrogen Deployments](https://shopify.dev/docs/storefronts/headless/hydrogen/deployments)
- [Shopify Hydrogen Environments](https://shopify.dev/docs/storefronts/headless/hydrogen/environments)
- [Shopify Metafield Data Types](https://shopify.dev/docs/apps/build/metafields/list-of-data-types)
- [Shopify Hydrogen SEO](https://shopify.dev/docs/storefronts/headless/hydrogen/seo)
- [predictiveSearch Storefront API](https://shopify.dev/docs/api/storefront/latest/queries/predictivesearch)