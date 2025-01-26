'use server';
import { GeinsCore, RuntimeContext } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type { OMSSettings } from '@geins/types';
import { reshapeCart, reshapeCheckout } from './reshape';
import { CartItemInputType, PageType } from './types';
const _settings: OMSSettings = { 
  context: RuntimeContext.HYBRID,
  defaultPaymentId: 23,
  defaultShippingId: 0
}



export const createCart = async (geinsCore: GeinsCore): Promise<any> => {
  const geinsOMS = new GeinsOMS(geinsCore);
  const geinsCart = geinsOMS.cart;

  const cart = await geinsCart.create();
  if (!cart) {
    return {};
  }

  return reshapeCart(cart);
};

export const getCart = async (geinsCore: GeinsCore, id: string | undefined): Promise<any> => {
  const geinsOMS = new GeinsOMS(geinsCore);
  const geinsCart = geinsOMS.cart;

  const cart = await geinsCart.get(id);
  if (!cart) {
    return {};
  }
  
  return reshapeCart(cart);
};

export const addToCart = async (
  geinsCore: GeinsCore,
  id: string,
  item: CartItemInputType
): Promise<any> => {
  const geinsOMS = new GeinsOMS(geinsCore);
  const geinsCart = geinsOMS.cart;

  await geinsCart.get(id);

  const result = await geinsCart.items.add({skuId:item.skuId, quantity:item.quantity});
  
  if (!result) {
    throw new Error('Failed to add item to cart');
  }

  const cart = await geinsCart.get();  
  if (!cart) {
    return {};
  }
  return reshapeCart(cart);
};

export const removeFromCart = async (
  geinsCore: GeinsCore,
  id: string,
  itemId: string
): Promise<any> => {
  const geinsOMS = new GeinsOMS(geinsCore);
  const geinsCart = geinsOMS.cart;

  await geinsCart.get(id);
  
  const result = await geinsCart.items.delete({id: itemId, upd});

  if(!result) {
    throw new Error('Failed to remove item from cart');
  }

  const cart = await geinsCart.get();   

  if (!cart) {
    return {};
  }

  return reshapeCart(cart);
};

export const updateCart = async (
  geinsCore: GeinsCore,
  id: string,
  item: CartItemInputType
): Promise<any> => {
  const geinsOMS = new GeinsOMS(geinsCore);
  const geinsCart = geinsOMS.cart;

  await geinsCart.get(id);

  const result = await geinsCart.items.update({item: {id: item.id, quantity: item.quantity}});
  if(!result) {
    throw new Error('Failed to update item in cart');
  }

  const cart = await geinsCart.get();
  if (!cart) {
    return {};
  }

};

export const getCheckoutPage = async (geinsCore: GeinsCore, cartId: string): Promise<PageType> => {
  const geinsOMS = new GeinsOMS(geinsCore, { omsSettings: _settings });
  const data = await geinsOMS.checkout.get({cartId: cartId, paymentMethodId:23});  
  if(!data) {
    throw new Error('Failed to get checkout page');
  }
  return reshapeCheckout(data);
};
