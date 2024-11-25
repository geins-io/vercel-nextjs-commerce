import { CartType } from "./types";


  // Mock Data for Products
  export const mockProducts = Array.from({ length: 25 }, (_, i) => {
      const id = (i + 1).toString();
      return {
        id,
        currency: 'USD',
        slug: `mock-product-${id}`,
        stockTracking: true,
        stockPurchasable: i % 2 === 0,
        stockLevel: 15 + i,
        name: `Mock Product ${id}`,
        description: `Description for Mock Product ${id}. Includes various options and variants.`,
        options: [
          {
            name: 'Size',
            id: 'opt1',
            description: 'Select the size',
            variant: true,
            values: [
              { id: 'opt1-val1', name: 'Small', price: 0 },
              { id: 'opt1-val2', name: 'Medium', price: 5 },
              { id: 'opt1-val3', name: 'Large', price: 10 },
            ],
          },
          {
            name: 'Color',
            id: 'opt2',
            description: 'Select the color',
            variant: true,
            values: [
              { id: 'opt2-val1', name: 'Red', price: 0 },
              { id: 'opt2-val2', name: 'Blue', price: 0 },
              { id: 'opt2-val3', name: 'Green', price: 0 },
            ],
          },
        ],
        price: 24.99 + i,
        variants: {
          results: [
            {
              id: `${id}-variant1`,
              name: 'Small Red',
              sku: `SM-RD-${id}`,
              prices: { price: 29.99, discountPercent: 0 },
              optionValueIds: ['opt1-val1', 'opt2-val1'],
              stockLevel: 5,
              currency: 'USD',
            },
            {
              id: `${id}-variant2`,
              name: 'Medium Blue',
              sku: `MD-BL-${id}`,
              prices: { price: 34.99, discountPercent: 5 },
              optionValueIds: ['opt1-val2', 'opt2-val2'],
              stockLevel: 8,
              currency: 'USD',
            },
            {
              id: `${id}-variant3`,
              name: 'Large Green',
              sku: `LG-GN-${id}`,
              prices: { price: 39.99, discountPercent: 10 },
              optionValueIds: ['opt1-val3', 'opt2-val3'],
              stockLevel: 3,
              currency: 'USD',
            },
          ],
        },
        images: [
          {
            file: { url: `https://prd.place/300/300`, width: 300, height: 300 },
            caption: `Image of Mock Product ${id}`,
          },
          {
            file: { url: `https://prd.place/300/300`, width: 300, height: 300 },
            caption: `Secondary Image of Mock Product ${id}`,
          },
        ],
        metaTitle: `Meta Title for Mock Product ${id}`,
        metaDescription: `Meta Description for Mock Product ${id}`,
        tags: ['start', 'mock', 'product', 'example', `category-${i % 5}`],
      };
  });
  
  // Mock Data for Cart
  export const mockCart2 = {
    checkoutUrl: "https://example.com/checkout",
    subTotal: 150.00,
    grandTotal: 165.00,
    currency: "USD",
    taxes: [{ amount: 15.00 }],
    items: [
      {
        id: "item1",
        quantity: 2,
        price: 50.00,
        discountTotal: 5.00,
        taxTotal: 2.50,
        variantId: "variant1",
        options: [{ name: "Color", value: "Red" }],
        variant: { name: "Standard" },
        product: {
          id: "prod1",
          name: "Sample Product",
          currency: "USD",
          slug: "sample-product",
          images: [
            {
              file: {
                url: "https://example.com/image.jpg",
                width: 100,
                height: 100,
              },
              caption: "Product Image",
            },
          ],
        },
      },
    ],
  };
  
  // Mock Data for Categories
  export const mockCategories = [
    {
      id: "cat1",
      name: "Electronics",
      slug: "electronics",
      metaDescription: "Shop the best in electronics",
      metaKeywords: ["electronics", "gadgets"],
      description: "Find a variety of electronic gadgets",
    },
    {
      id: "cat2",
      name: "Clothing",
      slug: "clothing",
      metaDescription: "Trendy and stylish clothing",
      metaKeywords: ["clothing", "fashion"],
      description: "Explore our latest fashion collection",
    },
    // Additional categories can be added here.
  ];
  
  // Mock Data for Menu
  export const mockMenu = {
    id: "footer",
    name: "Main Menu",
    items: [
      {
        id: "item1",
        label: "Home",
        open: false,
        hidden: false,
        targetBlank: false,
        type: "link",
        order: 1,
        title: "Home Page",
        canonicalUrl: "/home",
        path: "/home",
      },
      {
        id: "item2",
        label: "Shop",
        open: false,
        hidden: false,
        targetBlank: false,
        type: "link",
        order: 2,
        title: "Shop Page",
        canonicalUrl: "/shop",
        path: "/shop",
      },
      {
        id: "item3",
        label: "Contact",
        open: false,
        hidden: false,
        targetBlank: false,
        type: "link",
        order: 3,
        title: "Contact Us",
        canonicalUrl: "/contact",
        path: "/contact",
      },
    ],
  };
  
  export const mockCart: CartType = {
    id: "mock-cart-id",
    checkoutUrl: "https://mock-checkout-url.com",
    cost: {
      subtotalAmount: { amount: "100.00", currencyCode: "USD" },
      totalAmount: { amount: "120.00", currencyCode: "USD" },
      totalTaxAmount: { amount: "20.00", currencyCode: "USD" },
    },
    totalQuantity: 2,
    lines: [
      {
        id: "mock-line-id-1",
        quantity: 1,
        cost: {
          totalAmount: { amount: "60.00", currencyCode: "USD" },
        },
        merchandise: {
          id: "mock-variant-id-1",
          title: "Mock Variant 1",
          selectedOptions: [
            { name: "Size", value: "Medium" },
            { name: "Color", value: "Red" },
          ],
          product: {
            id: "mock-product-id-1",
            handle: "mock-product-1",
            title: "Mock Product 1",
            featuredImage: {
              caption: "Featured image for Mock Product 1",
              altText: "An amazing red shirt",
              url: "https://labs.commerce.services/product/1600f2000/arket-dana-sweater-pink.jpg",
              src: "https://labs.commerce.services/product/1600f2000/arket-dana-sweater-pink.jpg",
              width: 800,
              height: 800,
            },
          },
        },
      },
      {
        id: "mock-line-id-2",
        quantity: 1,
        cost: {
          totalAmount: { amount: "60.00", currencyCode: "USD" },
        },
        merchandise: {
          id: "mock-variant-id-2",
          title: "Mock Variant 2",
          selectedOptions: [
            { name: "Size", value: "Large" },
            { name: "Color", value: "Blue" },
          ],
          product: {
            id: "mock-product-id-2",
            handle: "mock-product-2",
            title: "Mock Product 2",
            featuredImage: {
              caption: "Featured image for Mock Product 2",
              altText: "A stylish blue hoodie",
              url: "https://labs.commerce.services/product/1600f2000/arket-dana-sweater-pink.jpg",
              src: "https://labs.commerce.services/product/1600f2000/arket-dana-sweater-pink.jpg",
              width: 800,
              height: 800,
            },
          },
        },
      },
    ],
  };
  