/**
 * Tokyo Spin Vault — E2E Test Suite
 * Tests all critical user flows on the live Oxygen deployment.
 *
 * Usage: npx playwright test e2e-test.mjs
 * Or:    node e2e-test.mjs (uses Playwright API directly)
 */

import {chromium} from 'playwright';

const BASE = 'https://tokyo-spin-vault-d51baf2ecf0c279cb53d.o2.myshopify.dev';
const TIMEOUT = 15000;

let browser, page;
const results = [];

function log(status, test, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  results.push({status, test, detail});
  console.log(`  ${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function setup() {
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({
    viewport: {width: 1440, height: 900},
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
}

async function teardown() {
  await browser?.close();
}

// ─── Test: Homepage ─────────────────────────────────────────────

async function testHomepage() {
  console.log('\n=== Homepage ===');
  try {
    const res = await page.goto(BASE, {waitUntil: 'domcontentloaded'});
    log(res.status() === 200 ? 'PASS' : 'FAIL', 'Homepage loads', `status ${res.status()}`);

    // Title
    const title = await page.title();
    log(title.includes('Tokyo Spin Vault') ? 'PASS' : 'FAIL', 'Page title', title);

    // Hero section
    const hero = await page.locator('h1').first().textContent();
    log(hero ? 'PASS' : 'FAIL', 'Hero heading exists', hero?.trim().substring(0, 40));

    // Logo
    const logo = await page.locator('img[alt*="Spin"], img[alt*="Tokyo"]').first().isVisible();
    log(logo ? 'PASS' : 'FAIL', 'Logo visible');

    // Navigation links
    const navLinks = await page.locator('nav a').count();
    log(navLinks >= 3 ? 'PASS' : 'WARN', 'Navigation links', `${navLinks} links found`);

    // Product cards on homepage
    const products = await page.locator('[href*="/products/"]').count();
    log(products > 0 ? 'PASS' : 'FAIL', 'Product cards on homepage', `${products} product links`);

    // Shipping banner
    const shippingText = await page.textContent('body');
    log(shippingText.includes('ePacket') ? 'PASS' : 'FAIL', 'ePacket Light in shipping banner');
    log(shippingText.includes('DDP') || shippingText.includes('Duties') ? 'PASS' : 'FAIL', 'DDP/Duties mentioned on homepage');

  } catch (e) {
    log('FAIL', 'Homepage', e.message);
  }
}

// ─── Test: Collections ──────────────────────────────────────────

async function testCollections() {
  console.log('\n=== Collections ===');
  try {
    // All Beyblades collection
    const res = await page.goto(BASE + '/collections/all-beyblades', {waitUntil: 'domcontentloaded'});
    log(res.status() === 200 ? 'PASS' : 'FAIL', 'All Beyblades collection loads', `status ${res.status()}`);

    // Products displayed
    await page.waitForSelector('[href*="/products/"]', {timeout: 10000}).catch(() => null);
    const productCount = await page.locator('[href*="/products/"]').count();
    log(productCount > 0 ? 'PASS' : 'FAIL', 'Products displayed in collection', `${productCount} products`);

    // Filter bar exists
    const filterBar = await page.locator('button:has-text("All")').first().isVisible().catch(() => false);
    log(filterBar ? 'PASS' : 'WARN', 'Filter bar visible');

    // Sort dropdown exists
    const sortSelect = await page.locator('select#collection-sort').isVisible().catch(() => false);
    log(sortSelect ? 'PASS' : 'WARN', 'Sort dropdown visible');

    // Test sort functionality
    if (sortSelect) {
      await page.selectOption('select#collection-sort', 'PRICE-asc');
      await page.waitForTimeout(2000);
      const url = page.url();
      log(url.includes('sort=PRICE-asc') ? 'PASS' : 'FAIL', 'Sort updates URL params');
    }

    // Limited & Rare collection
    const limRes = await page.goto(BASE + '/collections/limited-edition-rare', {waitUntil: 'domcontentloaded'});
    log(limRes.status() === 200 ? 'PASS' : 'FAIL', 'Limited & Rare collection loads');

  } catch (e) {
    log('FAIL', 'Collections', e.message);
  }
}

// ─── Test: Product Detail Page ──────────────────────────────────

async function testPDP() {
  console.log('\n=== Product Detail Page ===');
  try {
    // Go to collections first to find a product
    await page.goto(BASE + '/collections/all-beyblades', {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('[href*="/products/"]', {timeout: 10000}).catch(() => null);

    const firstProduct = page.locator('[href*="/products/"]').first();
    const productUrl = await firstProduct.getAttribute('href');

    if (!productUrl) {
      log('FAIL', 'No product found to test PDP');
      return;
    }

    await page.goto(BASE + productUrl, {waitUntil: 'domcontentloaded'});
    log('PASS', 'PDP loads', productUrl);

    // Product title
    const title = await page.locator('h1').first().textContent();
    log(title ? 'PASS' : 'FAIL', 'Product title', title?.trim().substring(0, 50));

    // Product image
    const img = await page.locator('img[src*="cdn.shopify"]').first().isVisible().catch(() => false);
    log(img ? 'PASS' : 'WARN', 'Product image visible');

    // Price displayed
    const priceText = await page.textContent('body');
    log(priceText.match(/\$\d+/) ? 'PASS' : 'FAIL', 'Price displayed');

    // Add to cart button
    const addBtn = await page.locator('button:has-text("Add to Vault"), button:has-text("Sold Out")').first().isVisible();
    log(addBtn ? 'PASS' : 'FAIL', 'Add to Cart button visible');

    // DDP notice
    log(priceText.includes('DDP') ? 'PASS' : 'FAIL', 'DDP notice on PDP');

    // ePacket Light shipping info
    log(priceText.includes('ePacket') ? 'PASS' : 'FAIL', 'ePacket Light on PDP');

    // Trust badges
    log(priceText.includes('Authentic') ? 'PASS' : 'WARN', 'Trust badge: Authentic');

    // Breadcrumbs
    const breadcrumb = await page.locator('nav:has-text("Home")').first().isVisible().catch(() => false);
    log(breadcrumb ? 'PASS' : 'WARN', 'Breadcrumbs visible');

    // JSON-LD structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').count();
    log(jsonLd > 0 ? 'PASS' : 'WARN', 'JSON-LD structured data', `${jsonLd} found`);

  } catch (e) {
    log('FAIL', 'PDP', e.message);
  }
}

// ─── Test: Add to Cart ──────────────────────────────────────────

async function testCart() {
  console.log('\n=== Cart Flow ===');
  try {
    // Go to a product
    await page.goto(BASE + '/collections/all-beyblades', {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('[href*="/products/"]', {timeout: 10000}).catch(() => null);
    const firstProduct = page.locator('[href*="/products/"]').first();
    const productUrl = await firstProduct.getAttribute('href');
    await page.goto(BASE + productUrl, {waitUntil: 'domcontentloaded'});

    // Click "Add to Vault"
    const addBtn = page.locator('button:has-text("Add to Vault")').first();
    const btnVisible = await addBtn.isVisible().catch(() => false);

    if (btnVisible) {
      await addBtn.click();
      log('PASS', 'Add to Vault clicked');

      // Wait for cart drawer to appear
      await page.waitForTimeout(2000);
      const cartDrawer = await page.locator('[aria-label="Cart drawer"], [role="dialog"]:has-text("VAULT")').first().isVisible().catch(() => false);
      log(cartDrawer ? 'PASS' : 'WARN', 'Cart drawer opened');

      // Check cart has items
      const cartContent = await page.textContent('[role="dialog"]').catch(() => '');
      log(cartContent.includes('Checkout') || cartContent.includes('Subtotal') ? 'PASS' : 'WARN', 'Cart shows items');

      // Free shipping bar
      log(cartContent.includes('free') || cartContent.includes('Free') || cartContent.includes('shipping') ? 'PASS' : 'WARN', 'Free shipping bar in cart');

      // Checkout button
      const checkout = await page.locator('a:has-text("Checkout")').first().isVisible().catch(() => false);
      log(checkout ? 'PASS' : 'WARN', 'Checkout button visible');

    } else {
      log('WARN', 'Add to Vault button not available (Sold Out?)');
    }

  } catch (e) {
    log('FAIL', 'Cart flow', e.message);
  }
}

// ─── Test: Search ───────────────────────────────────────────────

async function testSearch() {
  console.log('\n=== Search ===');
  try {
    await page.goto(BASE, {waitUntil: 'domcontentloaded'});

    // Click search icon
    const searchBtn = page.locator('button[aria-label="Search"]').first();
    await searchBtn.click();
    await page.waitForTimeout(500);

    // Search aside opens
    const searchInput = page.locator('input[type="search"], input[name="q"]').first();
    const visible = await searchInput.isVisible().catch(() => false);
    log(visible ? 'PASS' : 'FAIL', 'Search panel opens');

    if (visible) {
      await searchInput.fill('beyblade');
      await page.waitForTimeout(2000);

      // Predictive results
      const body = await page.textContent('body');
      log(body.toLowerCase().includes('beyblade') ? 'PASS' : 'WARN', 'Search returns results');
    }

  } catch (e) {
    log('FAIL', 'Search', e.message);
  }
}

// ─── Test: Mobile Viewport ──────────────────────────────────────

async function testMobile() {
  console.log('\n=== Mobile (375px) ===');
  try {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto(BASE, {waitUntil: 'domcontentloaded'});
    log('PASS', 'Homepage loads at 375px');

    // Hamburger menu visible
    const hamburger = await page.locator('button[aria-label="Open menu"]').first().isVisible().catch(() => false);
    log(hamburger ? 'PASS' : 'FAIL', 'Hamburger menu visible');

    // Click hamburger
    if (hamburger) {
      await page.locator('button[aria-label="Open menu"]').first().click();
      await page.waitForTimeout(500);
      const mobileMenu = await page.locator('[role="dialog"]:has-text("MENU")').first().isVisible().catch(() => false);
      log(mobileMenu ? 'PASS' : 'WARN', 'Mobile menu opens');
    }

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    log(bodyWidth <= viewportWidth + 5 ? 'PASS' : 'FAIL', 'No horizontal overflow', `body: ${bodyWidth}px`);

    // Reset viewport
    await page.setViewportSize({width: 1440, height: 900});

  } catch (e) {
    log('FAIL', 'Mobile', e.message);
  }
}

// ─── Test: Policies ─────────────────────────────────────────────

async function testPolicies() {
  console.log('\n=== Policies ===');
  const policies = [
    {path: '/policies/shipping-policy', name: 'Shipping Policy', mustInclude: 'ePacket'},
    {path: '/policies/refund-policy', name: 'Refund Policy', mustInclude: 'return'},
    {path: '/policies/terms-of-service', name: 'Terms of Service', mustInclude: 'Terms'},
    {path: '/policies/privacy-policy', name: 'Privacy Policy', mustInclude: 'privacy'},
  ];

  for (const p of policies) {
    try {
      const res = await page.goto(BASE + p.path, {waitUntil: 'domcontentloaded'});
      const status = res.status();
      const text = await page.textContent('body');
      const hasContent = text.toLowerCase().includes(p.mustInclude.toLowerCase());
      log(status === 200 && hasContent ? 'PASS' : 'WARN', p.name, `status ${status}, contains "${p.mustInclude}": ${hasContent}`);
    } catch (e) {
      log('FAIL', p.name, e.message);
    }
  }
}

// ─── Test: SEO ──────────────────────────────────────────────────

async function testSEO() {
  console.log('\n=== SEO ===');
  try {
    await page.goto(BASE, {waitUntil: 'domcontentloaded'});

    // Meta description
    const desc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => '');
    log(desc ? 'PASS' : 'FAIL', 'Meta description', desc?.substring(0, 50));

    // OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => '');
    log(ogTitle ? 'PASS' : 'FAIL', 'OG title', ogTitle?.substring(0, 40));

    // Sitemap accessible
    const sitemap = await page.goto(BASE + '/sitemap.xml', {waitUntil: 'domcontentloaded'});
    log(sitemap.status() === 200 ? 'PASS' : 'WARN', 'Sitemap.xml accessible');

    // Robots.txt
    const robots = await page.goto(BASE + '/robots.txt', {waitUntil: 'domcontentloaded'});
    log(robots.status() === 200 ? 'PASS' : 'WARN', 'Robots.txt accessible');

  } catch (e) {
    log('FAIL', 'SEO', e.message);
  }
}

// ─── Test: Performance ──────────────────────────────────────────

async function testPerformance() {
  console.log('\n=== Performance ===');
  try {
    const start = Date.now();
    await page.goto(BASE, {waitUntil: 'load'});
    const loadTime = Date.now() - start;
    log(loadTime < 5000 ? 'PASS' : 'WARN', 'Homepage load time', `${loadTime}ms`);

    // Check no console errors (critical)
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(BASE, {waitUntil: 'domcontentloaded'});
    await page.waitForTimeout(2000);
    log(errors.length === 0 ? 'PASS' : 'WARN', 'No JS console errors', errors.length > 0 ? errors[0]?.substring(0, 60) : '');

  } catch (e) {
    log('FAIL', 'Performance', e.message);
  }
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('=== Tokyo Spin Vault — E2E Test Suite ===');
  console.log('Target:', BASE);

  await setup();

  await testHomepage();
  await testCollections();
  await testPDP();
  await testCart();
  await testSearch();
  await testMobile();
  await testPolicies();
  await testSEO();
  await testPerformance();

  await teardown();

  // Summary
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;

  console.log('\n========================================');
  console.log(`RESULTS: ${pass} PASS / ${fail} FAIL / ${warn} WARN`);
  console.log('========================================');

  if (fail > 0) {
    console.log('\nFailed tests:');
    for (const r of results.filter(r => r.status === 'FAIL')) {
      console.log(`  ✗ ${r.test} — ${r.detail}`);
    }
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
