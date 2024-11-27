'use server';

import { GeinsCore, GeinsSettings } from '@geins/core';
import * as cms from './cms';
import * as oms from './oms';
import pim from './pim';
import { CartItemInputType, CartType, MenuItemType, PageType, ProductType } from './types';


const geinsSettings: GeinsSettings = {
    apiKey: process.env.GEINS_API_KEY || '',
    accountName: process.env.GEINS_ACCOUNT_NAME || '',
    channel: process.env.GEINS_CHANNEL || '',
    tld: process.env.GEINS_TLD || '',
    locale: process.env.GEINS_LOCALE || '',
    market: process.env.GEINS_MARKET || '',
    environment: 'qa',
};
const geinsCore = new GeinsCore(geinsSettings);

/* 
  COLLECTIONS / CATEFORIES
*/
export const getCollections = async (parentNodeId: number = 0) => {  
  const data =  await pim.getCategories(geinsCore, parentNodeId);  
  data.forEach((item) => {
    item.path = `/search/${item.slug}`;
  });  
  return data;
};

export const getCollection = async (slug: string):  Promise<any> => {
  return pim.getCategoryMetadata(geinsCore, slug);  
};

/* 
  PRODUCT LISTS
*/
export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<ProductType[]> {    
  return await pim.getProducts(geinsCore, {query: query, reverse, sortKey});; 
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
  } else if(collection === 'hidden-homepage-carousel') {
    category = 'carousel-on-start';    
  }
  
  return await pim.getCategoryProducts(geinsCore, {category, reverse, sortKey});
};

/* 
  PRODUCT
*/
export const getProduct = async (slug: string) => {  
  return  pim.getProduct(geinsCore, slug);
};

export async function getProductRecommendations(product: ProductType): Promise<ProductType[]> {
  return pim.getProductRecommendations(geinsCore, product);  
}

/* 
  CMS
*/
export const getMenu = async (id: string): Promise<MenuItemType[]> => {
  let menuId = '';
  if(id === 'next-js-frontend-footer-menu') {
    menuId = 'footer-first';
  } else if(id === 'next-js-frontend-header-menu') {
    menuId = 'main-desktop';
  }
  const data: MenuItemType[] =  await cms.getMenu(geinsCore, menuId);
  return data.filter((item) => item.title !== '');
}

export async function getPages(): Promise<PageType[]> {
  return [] as PageType[];
}

export async function getPage(handle: string): Promise<PageType> {  
  if(handle === 'checkout') {
    return oms.getCheckoutPage(geinsCore);
  }  
  return cms.getPage(geinsCore, handle);
}

/* 
  CART
*/
export async function createCart(): Promise<CartType> {  
  return await oms.createCart(geinsCore);
}

export async function getCart(cartId: string | undefined): Promise<CartType | undefined> {
  if(!cartId) {
    return undefined;
  }
  return  await oms.getCart(geinsCore, cartId);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CartType| undefined> {
    if(!cartId) {
      return undefined;
    }
    
    const items = lines.map((item) => {
      return {
        skuId: parseInt(item.merchandiseId),
        quantity: item.quantity,
      }
    });

    let cart = {} as CartType;
    for (let i = 0; i < items.length; i++) {
      cart = await oms.addToCart(geinsCore, cartId, items[i] as CartItemInputType);      
    }    
    return cart;
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<CartType| undefined> {
  if(!cartId) {
    return undefined;
  }

  // create geins item to add from lines
  const items = lines.map((item) => {
    return {
      id: item.id,      
      quantity: item.quantity,
    }
  });
   let cart = {} as CartType;
    for (let i = 0; i < items.length; i++) {
      cart = await oms.updateCart(geinsCore, cartId, items[i] as CartItemInputType);      
    }    
    return cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<CartType| undefined> {
    if(!cartId) {
      return undefined;
    }

    let cart = {} as CartType;
    for (let i = 0; i < lineIds.length; i++) {
      cart = await oms.removeFromCart(geinsCore, cartId, lineIds[i] as string);      
    }
    return cart;
}
