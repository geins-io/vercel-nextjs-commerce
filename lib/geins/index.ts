import { GeinsCore, GeinsSettings } from '@geins/core';
import { NextRequest, NextResponse } from 'next/server';
import cms from './cms';
import pim from './pim';
import { CartType, MenuItemType, PageType, ProductType } from './types';


const geinsSettings: GeinsSettings = {
    apiKey: process.env.GEINS_API_KEY || '',
    accountName: process.env.GEINS_ACCOUNT_NAME || '',
    channel: process.env.GEINS_CHANNEL || '',
    tld: process.env.GEINS_TLD || '',
    locale: process.env.GEINS_LOCALE || '',
    market: process.env.GEINS_MARKET || '',
};

const geinsCore = new GeinsCore(geinsSettings);
// get products wuery from file gql/products.graphql
// const productsQuery = 
export const getTest = async (slug: string) => {   
 // const menuQuery = queries.menu;  
 // const data = await geinsCore.graphql.query({ query: menuQuery, variables: { menuLocationId: "main-desktop"} });
 // console.log('** TEST', data);
};

export async function createCart(): Promise<CartType> {
  return {} as CartType;
}
export async function getCart(cartId: string | undefined): Promise<CartType | undefined> {
  // In this mock, sessionToken is unused; simply returns the mockCart
  // console.log('getCart', sessionToken);
  return {} as CartType;
};

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartType> {

    // console.log('addToCart', sessionToken, productId, quantity, options);
    return {} as CartType;
/*
  const product = mockProducts.find((p) => p.id === productId);
  if (product) {
    const newCartItem = {
      id: `${mockCart.items.length + 1}`,
      quantity,
      price: product.price * quantity,
      discountTotal: 0,
      taxTotal: 0,
      variantId: '',
      options: options || [],
      variant: { name: '' },
      product: {
        ...product,
        images: [],
      },
    };
    mockCart.items.push(newCartItem);
    mockCart.subTotal += newCartItem.price;
    mockCart.grandTotal += newCartItem.price; // Simplified; usually includes tax/shipping
  }
  return mockCart;
  */
};

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<CartType> {
    //console.log('updateCart', sessionToken, itemId, quantity);
    return {} as CartType;
};
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<CartType> {
    //console.log('removeFromCart', sessionToken, itemId);
    /*
  const itemIndex = mockCart.items.findIndex((item) => item.id === itemId);
  if (itemIndex !== -1) {
    const item = mockCart.items[itemIndex];
    mockCart.subTotal -= item.price;
    mockCart.grandTotal -= item.price;
    mockCart.items.splice(itemIndex, 1);
  }*/
  return {} as CartType;
};

export const getCollection = async (slug: string) => {
  //console.log('getCategory', slug);
  return pim.getCategoryMetadata(geinsCore, slug);
  // return mockCategories.find((category) => category.slug === slug);
};

export const getProduct = async (slug: string) => {
  //console.log('getProduct', slug);
  const data = pim.getProduct(geinsCore, slug);
  //console.log('getProduct data', data);
  return data;
};
export async function getProductRecommendations(productId: string): Promise<ProductType[]> {
  return [] as ProductType[];
}


export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<ProductType[]> {

  const data = await pim.getProducts(geinsCore, {query: query, reverse, sortKey});
  return data; 
};


export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<ProductType[]> {
  let category = collection;
  if(collection === 'hidden-homepage-featured-items') {
    category = 'start';
  }


  const data = await pim.getCategoryProducts(geinsCore, {category, reverse, sortKey});
  return data;
};

export async function getCategoryProducts({
  category,
  reverse,
  sortKey
}: {
  category: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<ProductType[]> {


  const data = await pim.getCategoryProducts(geinsCore, {category, reverse, sortKey});
  return data;
};

export const getCollections = async (parentNodeId: number = 0) => {  
  return await pim.getCategories(geinsCore, parentNodeId);
};

export const getCategories = async (parentNodeId: number) => {  
  return await pim.getCategories(geinsCore, parentNodeId);
};

export const getMenu = async (id: string): Promise<MenuItemType[]> => {

  let menuId = '';
  if(id === 'next-js-frontend-footer-menu') {
    menuId = 'footer-first';
  } else if(id === 'next-js-frontend-header-menu') {
    menuId = 'main-desktop';
  }


  return cms.getMenu(geinsCore, menuId);
}

export async function getPages(): Promise<PageType[]> {
  return [] as PageType[];
}

export async function getPage(handle: string): Promise<PageType> {
  return {} as PageType;
}

export async function revalidate2(req: any) {
 /*
  const { type } = await req.json();
  const secret = req.nextUrl?.searchParams?.get('secret');
  if (!secret || secret !== process.env.SWELL_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return { status: 200 };
  }

  const isCollectionUpdate = ['category.created', 'category.deleted', 'category.updated'].includes(type);
  const isProductUpdate = ['product.created', 'product.deleted', 'product.updated'].includes(type);

  if (isCollectionUpdate) {
    console.log("Revalidating collections...");
  }

  if (isProductUpdate) {
    console.log("Revalidating products...");
  }*/

  return { status: 200, revalidated: true, now: Date.now() };
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  /*
  const collectionWebhooks = ['collections/create', 'collections/delete', 'collections/update'];
  const productWebhooks = ['products/create', 'products/delete', 'products/update'];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }
*/
  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}