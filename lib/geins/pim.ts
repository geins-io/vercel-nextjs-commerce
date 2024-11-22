import { GeinsCore } from '@geins/core';
import { categoriesQuery } from './queries/queries/categories';
import { listPageInfoQuery } from './queries/queries/listPageInfo';
import { productQuery } from './queries/queries/product';
import { productsQuery } from './queries/queries/products';

import {
  CategoryItemType,
  CollectionType,
  ProductImageType,
  ProductType
} from './types';
const CURRENCY_CODE = process.env.GEINS_CURRENCY_CODE || 'USD';
const SHORT_DESCRIPTION = process.env.GEINS_PRODUCT_DESCRIPTION_SHORT_TEXT || 'text2';

const IMAGE_URL = process.env.GEINS_IMAGE_URL || 'https://labs.commerce.services';

const reshapeCategories = (geinsCategories: any): CategoryItemType[] => {
    if (!geinsCategories || !geinsCategories?.categories.length) {
        return [];
    }

   return geinsCategories.categories.map((item: any) => ({
        id: item?.categoryId ?? '',
        title: item?.name ?? '',
        name: item?.name ?? '',
        parentId: item?.parentCategoryId || '',
        path: item?.canonicalUrl?.split('/').pop() ||  '',
        slug: item?.alias ?? '',
    }));
}

const reshapeListPageMetadata = (geinsCategoryMetadata: any): CollectionType => {
    const rawCategory = geinsCategoryMetadata?.listPageInfo;
    if(!rawCategory) {
        return {} as CollectionType;
    }
    
    let seoTitle = rawCategory?.meta?.title || rawCategory?.name || '';
    seoTitle = seoTitle.replace(/\[name\]/g, rawCategory?.name || '');
    
    const seoDescription = rawCategory?.meta?.description || '';

    return {
        id: rawCategory?.id || '',
        title: rawCategory?.name || '',
        handle: rawCategory?.alias || '',       
        seo: {
            title: seoTitle,
            description: seoDescription,
        },
        description: rawCategory?.primaryDescription || '',
    };
   
}

const reshapeProducts = (geinsData: any): ProductType[] => {    
    if (!geinsData || !geinsData.products) {
      throw new Error('Invalid products query response');
    }
    const rawProducts = geinsData.products.products;
    if(!rawProducts) {
      return [];
    }
    return rawProducts.map((product: any) => reshapeProduct(product));    
};

const reshapeProduct = (geinsProductData: any): ProductType => {   
    const rawProduct = geinsProductData;
    console.log('*** rawProduct', rawProduct);

    const shortDescription = rawProduct.texts?.[SHORT_DESCRIPTION] || '';
    const images = rawProduct.productImages.map((image: any): ProductImageType => ({
      caption: rawProduct.name,
      altText: rawProduct.name,
      src: `${IMAGE_URL}/product/1600f2000/${image.fileName}`,
      url: `${IMAGE_URL}/product/1600f2000/${image.fileName}`,        
      height: 1600,     
      width: 2000,
    }))

    return {
      id: rawProduct.productId,
      seo: {
        title: rawProduct.meta?.title,
        description: rawProduct.meta?.description,
      },
      metaTitle: rawProduct.meta?.title || rawProduct.name,
      metaDescription: rawProduct.meta?.description || shortDescription,
      name: rawProduct.name,
      title: rawProduct.name,
      slug: rawProduct.alias,
      handle: rawProduct.alias,
      description: shortDescription,
      priceRange: {
        minVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: CURRENCY_CODE,
        },
        maxVariantPrice: {
          amount: rawProduct.unitPrice.sellingPriceIncVat,
          currencyCode: CURRENCY_CODE,
        },
      },
      price: rawProduct.unitPrice.sellingPriceIncVat,
      currency: CURRENCY_CODE,
      
      stockTracking: !!rawProduct.totalStock,
      stockPurchasable: rawProduct.totalStock?.inStock || false,
      stockLevel: rawProduct.totalStock?.totalStock || 0,
      availableForSale: true,
      tags: [],
      options: [],
      variants:[],
      featuredImage: images[0],
      images: images,
    };    
};

const translateSortKey = (sortKey: string, reverse: boolean): string => {
  switch (sortKey) {
    case 'BEST_SELLING':
      return 'MOST_SOLD';
    case 'CREATED_AT':
      return 'LATEST';
    case 'PRICE':
      if (reverse) {
        return 'PRICE';
      }
      return 'PRICE_DESC';
    default:
      return 'RELEVANCE';
  }
}

const pim = {

  getCategoryMetadata: async (geinsCore: GeinsCore, slug: string): Promise<any>  => {
      const data = await geinsCore.graphql.query({ queryAsString: listPageInfoQuery, variables: { url: slug } });        
      return reshapeListPageMetadata(data);
  },

  getCategories: async (geinsCore: GeinsCore, parentNodeId?: number): Promise<CategoryItemType[]> => {        
      const variables = { 
          includeHidden: false, 
          parentCategoryId: parentNodeId,

      };
      const data = await geinsCore.graphql.query({ queryAsString: categoriesQuery, variables });
      return reshapeCategories(data);
  },

  getProduct: async (geinsCore: GeinsCore, slug: string): Promise<ProductType | undefined> => {
      const variables = {
          alias: slug,
      };
     
      const data = await geinsCore.graphql.query({ queryAsString: productQuery, variables });  
      if(!data.product) {
          return undefined;
      }
      return reshapeProduct(data.product);
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

      const data = await geinsCore.graphql.query({ queryAsString: productsQuery, variables });
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
              sort: translateSortKey(sortKey || '', reverse || false),
              includeCollapsed: false,
          }
      };
      const data = await geinsCore.graphql.query({ queryAsString: productsQuery, variables });
      return reshapeProducts(data);
  }

};

export default pim;