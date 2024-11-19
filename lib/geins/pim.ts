import { GeinsCore } from '@geins/core';
import { queries } from './queries';
import {
  CategoryItemType,
  ProductImageType,
  ProductType,
} from './types';
const SHORT_DESCRIPTION = process.env.GEINS_PRODUCT_DESCRIPTION_SHORT_TEXT || 'text2';

const reshapeCategories = (geinsCategories: any): CategoryItemType[] => {
    if (!geinsCategories || !geinsCategories?.categories.length) {
        return [];
    }

   return geinsCategories.categories.map((item: any) => ({
        id: item?.categoryId ?? '',
        title: item?.name ?? '',
        name: item?.name ?? '',
        parentId: item?.parentCategoryId || '',
        path: item?.canonicalUrl ?? '',
        slug: item?.alias ?? '',
    }));
}

const reshapeListPageMetadata = (geinsCategoryMetadata: any): any => {
    const category = geinsCategoryMetadata?.listPageInfo;
    return category;
   
}

const reshapeProducts = (response: any): ProductType[] => {
    if (!response || !response.products.products) {
      throw new Error('Invalid products query response');
    }
    console.log('response', response.products.products[0].unitPrice.sellingPriceIncVatFormatted);
  
    const retVal =  response.products.products.map((rawProduct: any): ProductType => ({
      id: rawProduct.productId,
      seo: {
        title: rawProduct.meta?.title,
        description: rawProduct.meta?.description,
      },
      metaTitle: '',
      metaDescription: '',
      name: rawProduct.name,
      title: rawProduct.name,
      slug: rawProduct.alias,
      handle: rawProduct.alias,
      description: rawProduct.texts[SHORT_DESCRIPTION],
      priceRange: {
        minVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: 'USD',
        },
        maxVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: 'USD',
        },
      },
      price: rawProduct.unitPrice.sellingPriceIncVat,
      currency: 'USD',
      
      stockTracking: !!rawProduct.totalStock,
      stockPurchasable: rawProduct.totalStock?.inStock || false,
      stockLevel: rawProduct.totalStock?.totalStock || 0,
      availableForSale: true,
      tags: [],
      options: [],
      variants:[],
      featuredImage: rawProduct.productImages[0],
      images: rawProduct.productImages.map((image: any): ProductImageType => ({
        caption: rawProduct.name,
        url: `https://labs.commerce.services/product/1600f2000/${image.fileName}`,
        width: 2000,
        height: 1600,     
      })),
    }));
    
    return retVal;
    
};

const reshapeProduct = (geinsData: any): ProductType => {
    // console.log('*** geinsData', geinsData);
    const rawProduct = geinsData.product;

    const retVal: ProductType  ={
      id: rawProduct.productId,
      seo: {
        title: rawProduct.meta?.title,
        description: rawProduct.meta?.description,
      },
      metaTitle: '',
      metaDescription: '',
      name: rawProduct.name,
      title: rawProduct.name,
      slug: rawProduct.alias,
      handle: rawProduct.alias,
      description: rawProduct.texts[SHORT_DESCRIPTION],
      priceRange: {
        minVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: 'USD',
        },
        maxVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: 'USD',
        },
      },
      price: rawProduct.unitPrice.sellingPriceIncVat,
      currency: 'USD',
      
      stockTracking: !!rawProduct.totalStock,
      stockPurchasable: rawProduct.totalStock?.inStock || false,
      stockLevel: rawProduct.totalStock?.totalStock || 0,
      availableForSale: true,
      tags: [],
      options: [],
      variants:[],
      featuredImage: rawProduct.productImages[0],
      images: rawProduct.productImages.map((image: any): ProductImageType => ({
        caption: rawProduct.name,
        url: `https://labs.commerce.services/product/1600f2000/${image.fileName}`,
        width: 2000,
        height: 1600,     
      })),
    };
    console.log('retVal', retVal);
    
    return retVal;
    
};

const pim = {

    getCategoryMetadata: async (geinsCore: GeinsCore, slug: string): Promise<any>  => {
        const data = await geinsCore.graphql.query({ query: queries.listpageMetadata, variables: { url:slug } });        
        return reshapeListPageMetadata(data);
    },

    getCategories: async (geinsCore: GeinsCore, parentNodeId?: number): Promise<CategoryItemType[]> => {        
        const variables = { 
            includeHidden: false, 
            parentCategoryId: parentNodeId,

        };
        const data = await geinsCore.graphql.query({ query: queries.categories, variables });
        return reshapeCategories(data);
    },

    getProduct: async (geinsCore: GeinsCore, slug: string): Promise<ProductType | undefined> => {
        const variables = {
            alias: slug,
        };
        const data = await geinsCore.graphql.query({ query: queries.productByAlias, variables });        
        return reshapeProduct(data);
    },

    getProducts: async (geinsCore: GeinsCore, {
        query,
        reverse,
        sortKey
      }: {
        query?: string;
        reverse?: boolean;
        sortKey?: string;
      }): Promise<any> => {
        const variables = {
            filter: {
                sort: sortKey,
                includeCollapsed: true,
                filterMode: 'CURRENT',
                searchText: query,
            }
        };
        const data = await geinsCore.graphql.query({ query: queries.productsByCategory, variables });
        return reshapeProducts(data);
    },

    getCategoryProducts: async (geinsCore: GeinsCore, {
        category,
        reverse,
        sortKey
      }: {
        category: string;
        reverse?: boolean;
        sortKey?: string;
      }): Promise<any> => {
        const variables = {
            categoryAlias: category,
            filter: {
                sort: sortKey,
                includeCollapsed: false,
            }
        };

        const data = await geinsCore.graphql.query({ query: queries.productsByCategory, variables });
        // console.log('data', data);
        return reshapeProducts(data);
    }

};

export default pim;