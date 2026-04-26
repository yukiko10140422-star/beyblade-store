/**
 * ─── Fragment Architecture ───────────────────────────────────────────
 *
 * SHARED (this file):
 *   Money          — MoneyV2 fields (amount + currencyCode)
 *   ProductItem    — Product cards / list views (includes beyblade type metafield)
 *   Cart*          — CartLine, CartLineComponent, CartApiQuery
 *   Menu / Header / Footer — Navigation menus + shop info
 *
 * ROUTE-SPECIFIC (intentionally kept in their routes):
 *   products.$handle.tsx  — Product + ProductVariant (PDP-rich: variants, all metafields, seo)
 *   search.tsx            — Search* + Predictive* (search-specific fields + tracking)
 *   collections._index.tsx — Collection (collection list page)
 *   blogs.$blogHandle._index.tsx — ArticleItem (blog list page)
 *   policies._index.tsx   — PolicyItem
 *   policies.$handle.tsx  — Policy
 *
 * CUSTOMER ACCOUNT API (separate GraphQL endpoint, cannot share):
 *   graphql/customer-account/ — OrderMoney, Order*, Customer*, Address
 *
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Shared Money fragment — use in any query that references MoneyV2.
 * Interpolate via ${MONEY_FRAGMENT} in GraphQL template strings.
 */
export const MONEY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
` as const;

/**
 * Shared ProductItem fragment — use for product cards / list views.
 * Includes tags for availability badges (Pre-Order, Limited, etc.).
 * Requires MONEY_FRAGMENT to also be interpolated in the same query.
 */
export const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...Money
      }
      maxVariantPrice {
        ...Money
      }
    }
    beybladeType: metafield(namespace: "beyblade", key: "type") { value }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
// Uses MONEY_FRAGMENT (defined above). Prepend ${MONEY_FRAGMENT} when composing the full query.
export const CART_QUERY_FRAGMENT = `#graphql
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    parentRelationship {
      parent {
        id
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    lineComponents {
      ...CartLine
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
` as const;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;
