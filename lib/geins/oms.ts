'use server';
import { GeinsCore } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type { OMSSettings } from '@geins/types';
import { RuntimeContext } from '@geins/types';
import { PAYMENT_ID } from './constants';
import { checkoutMutation } from './queries/mutations/checkout';
import { reshapeCart, reshapeCheckout } from './reshape';
import { CartItemInputType, PageType } from './types';

type MerchantDataTemplate = {
  extraData: string;
  extraNumber?: number;
}

const myTemplate: MerchantDataTemplate = {
  extraData: '',
  extraNumber: 0
}


const omsSettings1: OMSSettings = {
  context: RuntimeContext.CLIENT
};
const omsSettings: OMSSettings = {
  context: RuntimeContext.CLIENT,
  merchantDataTemplate: myTemplate
};


const getCartId = (id?: string): any => {
  return id;
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

  const result = await geinsCart.items.remove({id: itemId});
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
  console.log('getCheckoutPage', cartId);
  const variables = {
    cartId: cartId,
    checkout: {
      paymentId: PAYMENT_ID
    }
  };
  const data = await geinsCore.graphql.mutation({
    queryAsString: checkoutMutation,
    variables,
    requestOptions: { fetchPolicy: 'no-cache' }
  });
  return reshapeCheckout(data);
};
