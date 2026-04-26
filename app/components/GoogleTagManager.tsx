import {useAnalytics, useLoadScript} from '@shopify/hydrogen';
import {useEffect} from 'react';

const GTM_ID = 'GTM-MBMSS5JL';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Google Tag Manager integration for Shopify Hydrogen.
 * Subscribes to Hydrogen analytics events and pushes them to GTM's dataLayer.
 *
 * Based on: https://shopify.dev/docs/storefronts/headless/hydrogen/cookbook/gtm
 */
export function GoogleTagManager() {
  // Load GTM script
  const scriptStatus = useLoadScript(
    `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
  );

  // Initialize dataLayer
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
  }, []);

  const {subscribe, canTrack} = useAnalytics();

  useEffect(() => {
    if (!canTrack()) return;

    // Page view
    subscribe('page_viewed', () => {
      window.dataLayer.push({event: 'page_view'});
    });

    // Product viewed
    subscribe('product_viewed', (data) => {
      const products = (data as Record<string, unknown>).products as
        | Array<Record<string, string>>
        | undefined;
      const product = products?.[0];
      if (!product) return;
      window.dataLayer.push({
        event: 'product_viewed',
        ecommerce: {
          items: [
            {
              item_id: product.id,
              item_name: product.title,
              price: parseFloat(product.price),
              item_brand: product.vendor,
              item_variant: product.variantTitle,
              quantity: product.quantity,
            },
          ],
        },
      });
    });

    // Add to cart
    subscribe('product_added_to_cart', (data) => {
      const d = data as Record<string, unknown>;
      const products = d.products as Array<Record<string, string>> | undefined;
      const cart = d.cart as Record<string, unknown> | undefined;
      const cost = cart?.cost as Record<string, unknown> | undefined;
      const totalAmount = cost?.totalAmount as
        | Record<string, string>
        | undefined;
      const product = products?.[0];
      if (!product) return;
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: totalAmount?.currencyCode || 'USD',
          value: parseFloat(totalAmount?.amount || '0'),
          items: [
            {
              item_id: product.id,
              item_name: product.title,
              price: parseFloat(product.price),
              item_brand: product.vendor,
              item_variant: product.variantTitle,
              quantity: product.quantity,
            },
          ],
        },
      });
    });

    // Cart viewed
    subscribe('cart_viewed', (data) => {
      const d = data as Record<string, unknown>;
      const cart = d.cart as Record<string, unknown> | undefined;
      const cost = cart?.cost as Record<string, unknown> | undefined;
      const totalAmount = cost?.totalAmount as
        | Record<string, string>
        | undefined;
      window.dataLayer.push({
        event: 'view_cart',
        ecommerce: {
          currency: totalAmount?.currencyCode || 'USD',
          value: parseFloat(totalAmount?.amount || '0'),
        },
      });
    });

    // Collection viewed
    subscribe('collection_viewed', (data) => {
      const d = data as Record<string, unknown>;
      const collection = d.collection as Record<string, string> | undefined;
      window.dataLayer.push({
        event: 'view_item_list',
        ecommerce: {
          item_list_id: collection?.id,
          item_list_name: collection?.handle,
        },
      });
    });

    // Search viewed
    subscribe('search_viewed', (data) => {
      const d = data as Record<string, unknown>;
      window.dataLayer.push({
        event: 'search',
        search_term: d.searchTerm,
      });
    });
  }, [subscribe, canTrack]);

  if (scriptStatus !== 'done') return null;

  return null;
}
