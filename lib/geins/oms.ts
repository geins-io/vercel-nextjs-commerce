'use server';

import { GeinsCore } from '@geins/core';
import { cartAddMutation } from './queries/mutations/cart-add';

import { cartUpdateMutation } from './queries/mutations/cart-line-update';
import { checkoutMutation } from './queries/mutations/checkout';
import { cartCreateQuery } from './queries/queries/cart-create';
import { cartGetQuery } from './queries/queries/cart-get';
import { CartItemInputType, CartItemType, CartType, PageType } from './types';

const CURRENCY_CODE = process.env.GEINS_CURRENCY_CODE || 'USD';
const IMAGE_URL = process.env.GEINS_IMAGE_URL || 'https://labs.commerce.services';
const PAYMENT_ID = parseInt(process.env.GEINS_PAYMENT_ID || '23'):

const reshapeCart = (geinsData: any): CartType => {    
    
    if (!geinsData) {
        return {} as CartType;
    }

    const items: CartItemType[] = [];
    let totalQuantity = 0;
    geinsData.items?.forEach((item: any) => {
        totalQuantity += item.quantity;
        const sku = item.product.skus[0];
        items.push({
            id: item.id,
            quantity: item.quantity,
            cost: {
                totalAmount: {
                    amount: item.totalPrice.sellingPriceIncVat+'',
                    currencyCode: CURRENCY_CODE
                }
            },
            merchandise: {
                id: item.skuId,
                title: sku.name,
                selectedOptions: [{ name: 'Size', value: sku.name }],
                product: {
                    id: item.product.productId,
                    handle: item.product.alias,
                    title: item.product.name,
                    featuredImage: {
                        caption: item.product.name,
                        altText: item.product.name,
                        url: `${IMAGE_URL}/product/100f125/${item.product.productImages[0].fileName}`,
                        src: `${IMAGE_URL}/product/100f125/${item.product.productImages[0].fileName}`,
                        height: 1600,
                        width: 2000,
                    }
                }
            }
        });
    });

    const vatSum = geinsData.summary.total.sellingPriceIncVat - geinsData.summary.total.sellingPriceExVat;
    const data = {
        id: geinsData.id || 'no-cart-id',
        lines: items || [],
        totalQuantity: totalQuantity,
        cost: {
            subtotalAmount: { 
                amount: geinsData.summary.total.sellingPriceExVat+'', 
                currencyCode:CURRENCY_CODE 
            },            
            totalTaxAmount: { 
                amount: vatSum+'', 
                currencyCode: CURRENCY_CODE 
            },
            totalAmount: { 
                amount: geinsData.summary.total.sellingPriceIncVat+'', 
                currencyCode: CURRENCY_CODE 
            },
        },

        checkoutUrl: '/checkout',    
    }
    return data;
}

const reshapeCheckout = (geinsData: any): PageType => {
    const checkoutPage: PageType = {
        id: 'checkout',
        title: 'Checkout example',
        handle: 'checkout',
        body: '',
        bodySummary: '',
        seo: {
            title: 'Checkout',
            description: 'Checkout page',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };  

    if (!geinsData || !geinsData.createOrUpdateCheckout) {
        checkoutPage.body = 'No payment options available';
        return checkoutPage;
    }    
    if(!geinsData.createOrUpdateCheckout.paymentOptions || geinsData.createOrUpdateCheckout.paymentOptions.length === 0) {
        checkoutPage.body = 'No payment options available';
        return checkoutPage;
    }
    checkoutPage.body = geinsData.createOrUpdateCheckout.paymentOptions[0].paymentData;          
    return checkoutPage;
}


export const createCart = async (geinsCore: GeinsCore): Promise<any>  => { 
    const data = await geinsCore.graphql.query({ queryAsString: cartCreateQuery, variables: {}, requestOptions: { fetchPolicy: 'no-cache' }});
    if(!data || !data.getCart) {
        return {};
    }
    return reshapeCart(data.getCart);
}

export const getCart=  async (geinsCore: GeinsCore, id: string | undefined): Promise<any> => {
    const data = await geinsCore.graphql.query({ queryAsString: cartGetQuery, variables: { id }, requestOptions: { fetchPolicy: 'no-cache' }});
    if(!data || !data.getCart) {
        return {};
    }
    return reshapeCart(data.getCart);
}

export const addToCart = async (geinsCore: GeinsCore, id: string, item: CartItemInputType): Promise<any> => {
    const data = await geinsCore.graphql.mutation({ queryAsString: cartAddMutation, variables:{id: id, item: item,}, requestOptions: { fetchPolicy: 'no-cache' }});      
    if(!data || !data.addToCart) {
        return {};
    }
    return reshapeCart(data.addToCart);
}

export const removeFromCart = async (geinsCore: GeinsCore, id: string, itemId: string): Promise<any> => {
    const item = {
        id: itemId, 
        quantity: 0
    };
    const data = await geinsCore.graphql.mutation({ queryAsString: cartUpdateMutation, variables:{id, item }, requestOptions: { fetchPolicy: 'no-cache' }});      
    if(!data || !data.updateCartItem) {
        return {};
    }
    return reshapeCart(data.updateCartItem);
}

export const updateCart = async (geinsCore: GeinsCore, id: string, item: CartItemInputType): Promise<any> => {
    const data = await geinsCore.graphql.mutation({ queryAsString: cartUpdateMutation, variables:{id, item }, requestOptions: { fetchPolicy: 'no-cache' }});      
    if(!data || !data.updateCartItem) {
        return {};
    }
    return reshapeCart(data.updateCartItem);
}

export const getCheckoutPage = async (geinsCore: GeinsCore, cartId:string): Promise<PageType> => {
    
    const variables = { 
        cartId: cartId,
        checkout:{
            paymentId: PAYMENT_ID            
        }
    };
    const data = await geinsCore.graphql.mutation({ queryAsString: checkoutMutation, variables, requestOptions: { fetchPolicy: 'no-cache' }});
    return reshapeCheckout(data);
}

