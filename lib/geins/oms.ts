import { GeinsCore } from '@geins/core';
import { cartAddMutation } from './queries/mutations/cart-add';
import { cartUpdateMutation } from './queries/mutations/cart-line-update';
import { cartCreateQuery } from './queries/queries/cart-create';
import { cartGetQuery } from './queries/queries/cart-get';
import { CartItemInputType, CartItemType, CartType } from './types';

const CURRENCY_CODE = process.env.GEINS_CURRENCY_CODE || 'USD';
const IMAGE_URL = process.env.GEINS_IMAGE_URL || 'https://labs.commerce.services';

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
                    amount: item.unitPrice.sellingPriceIncVat+'',
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
        checkoutUrl: '#'    
    }

/*     console.log('');
    console.log('-------- RAW DATA');
   if(geinsData.items){
    console.log(geinsData.items);
    console.log('');
    } else {
        console.log('NO ITEMS');
    }
  
    console.log('-------------------');
    console.log('');
    console.log('');
       
    console.log('*** reshapeCart data');
    console.log(data);
    console.log('*******************');
    console.log('');
    console.log('');
    console.log('');  */
    return data;
}

const oms = {
    createCart: async (geinsCore: GeinsCore): Promise<any>  => {      
/*         console.log('');
        console.log('');
        */

        // make a copy of
        console.log('*** OMS . createCart');
        

        const data = await geinsCore.graphql.query({ queryAsString: cartCreateQuery, variables: {}, requestOptions: { fetchPolicy: 'no-cache' }});
        if(!data || !data.getCart) {
            return {};
        }
        return reshapeCart(data.getCart);
    },
    getCart: async (geinsCore: GeinsCore, id: string | undefined): Promise<any> => {
      //  console.log('');
      //  console.log('');
        console.log('*** OMS . getCart', id);
        const data = await geinsCore.graphql.query({ queryAsString: cartGetQuery, variables: { id }, requestOptions: { fetchPolicy: 'no-cache' }});
        if(!data || !data.getCart) {
            console.log('*** NO CART data:', data);
            return {};
        }
        return reshapeCart(data.getCart);
    },
    addToCart: async (geinsCore: GeinsCore, id: string, item: CartItemInputType): Promise<any> => {
        /* console.log('');
        console.log('');
        console.log('*-*-*-* OMS . addToCart', id, item); */
        // VOID? 
        const data = await geinsCore.graphql.mutation({ queryAsString: cartAddMutation, variables:{id: id, item: item,}, requestOptions: { fetchPolicy: 'no-cache' }});      
        if(!data || !data.addToCart) {
            console.log('*** NO CART data:', data);
            return {};
        }
        return reshapeCart(data.addToCart);
    },
    removeFromCart: async (geinsCore: GeinsCore, id: string, itemId: string): Promise<any> => {
        const item = {
            id: itemId, 
            quantity: 0
        };
        const data = await geinsCore.graphql.mutation({ queryAsString: cartUpdateMutation, variables:{id, item }, requestOptions: { fetchPolicy: 'no-cache' }});      
        if(!data || !data.updateCartItem) {
            console.log('*** NO CART data:', data);
            return {};
        }
        return reshapeCart(data.updateCartItem);
    },
    updateCart: async (geinsCore: GeinsCore, id: string, item: CartItemInputType): Promise<any> => {
        const data = await geinsCore.graphql.mutation({ queryAsString: cartUpdateMutation, variables:{id, item }, requestOptions: { fetchPolicy: 'no-cache' }});      
        if(!data || !data.updateCartItem) {
            console.log('*** NO CART data:', data);
            return {};
        }
        return reshapeCart(data.updateCartItem);
    }
};

export default oms;