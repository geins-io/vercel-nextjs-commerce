import { GeinsCore } from '@geins/core';
import { categoriesQuery } from './queries/queries/categories';
import { listPageInfoQuery } from './queries/queries/listPageInfo';
import { productQuery } from './queries/queries/product';
import { productsQuery } from './queries/queries/products';
import { relatedProductsQuery } from './queries/queries/products-related';

import {
  CategoryItemType,
  CollectionType,
  ProductImageType,
  ProductOptionType,
  ProductRelationType,
  ProductRelationTypeEnum,
  ProductType,
  ProductVariantType
} from './types';

const USE_CATEGORY_FOR_RECOMMENDATIONS_BACKUP = process.env.GEISN_USE_CATEGORY_FOR_RECOMMENDATIONS_BACKUP || true;
const CURRENCY_CODE = process.env.GEINS_CURRENCY_CODE || 'USD';
const SHORT_DESCRIPTION = process.env.GEINS_PRODUCT_DESCRIPTION_SHORT_TEXT || 'text2';
const LONG_DESCRIPTION = process.env.GEINS_PRODUCT_DESCRIPTION_LONG_TEXT || 'text1';
const IMAGE_URL = process.env.GEINS_IMAGE_URL || 'https://labs.commerce.services';
const DEFAULT_SKU_VARIATION = process.env.GEINS_SKU_DEFAULT_VARIATION || 'Size';

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
  if (!geinsData) {
    throw new Error('Invalid products query response');
  }
  const rawProducts = geinsData;
  if(!rawProducts) {
    return [];
  }
  return rawProducts.map((product: any) => reshapeProduct(product));    
};

const reshapeProduct = (geinsProductData: any): ProductType => {   
  const rawProduct = geinsProductData;  
  

  const tags: string[] = [];
  const relations: ProductRelationType[] = [];   
  if (rawProduct.primaryCategory) {
    tags.push(rawProduct.primaryCategory.name);      
    relations.push({
      type: ProductRelationTypeEnum.CATEGORY,
      name: rawProduct.primaryCategory.name,
      alias: rawProduct.primaryCategory.alias,
    });
  }

  if (rawProduct.brand) {
    tags.push(rawProduct.brand.name);
    relations.push({
      type: ProductRelationTypeEnum.BRAND,
      name: rawProduct.brand.name,
      alias: rawProduct.brand.alias,
    });
  }
  if(rawProduct.categories) {
    rawProduct.categories.forEach((category: any) => {        
      tags.push(category.name);
      
    });
  }
  // remove duplicates
  const uniqueTags = [...new Set(tags)];
  tags.push(...uniqueTags);
  

  // add descriptions from environment variables
  const shortDescription = rawProduct.texts?.[SHORT_DESCRIPTION] || '';
  const longDescription = rawProduct.texts?.[LONG_DESCRIPTION] || '';

  // add images
  const images = rawProduct.productImages?.map((image: any): ProductImageType => ({
    caption: rawProduct.name,
    altText: rawProduct.name,
    src: `${IMAGE_URL}/product/1200f1500/${image.fileName}`,
    url: `${IMAGE_URL}/product/1200f1500/${image.fileName}`,        
    height: 1600,     
    width: 2000,
  }));

  // add variations and options
  let variations: ProductVariantType[] = []; 
  let options: ProductOptionType[] = [];
  
  if(rawProduct.variantGroup) {
    variations = [...reshapeProductVariations(rawProduct)];   
    options = [...reshapeProductOptions(variations)];
  }   

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
    descriptionHtml: rawProduct.texts?.text1 || '',
    priceRange: {
      minVariantPrice: {
        amount: rawProduct.unitPrice?.sellingPriceIncVat,
        currencyCode: CURRENCY_CODE,
      },
      maxVariantPrice: {
        amount: rawProduct.unitPrice?.sellingPriceIncVat,
        currencyCode: CURRENCY_CODE,
      },
    },
    price: rawProduct.unitPrice.sellingPriceIncVat,
    currency: CURRENCY_CODE,    
    stockTracking: !!rawProduct.totalStock,
    stockPurchasable: rawProduct.totalStock?.inStock || false,
    stockLevel: rawProduct.totalStock?.totalStock || 0,
    availableForSale: true,
    tags: tags || [],
    options: [...options]|| [],
    variants: variations || [],
    featuredImage: images[0],
    images: images,
    relations: relations,
  };    
};

const reshapeProductOptions = (variants: any[]): ProductOptionType[] => {  
    const optionsMap: Record<string, { id: string; name: string; values: Set<string> }> = {};
  
    variants.forEach((variant) => {
      if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
        variant.selectedOptions.forEach((option: { name: string; value: string }) => {
          // Ensure `optionsMap[option.name]` is initialized
          if (!optionsMap[option.name]) {
            optionsMap[option.name] = {
              id: option.name.toLowerCase(),
              name: option.name,
              values: new Set(),
            };
          }
          // Now it is safe to access `optionsMap[option.name].values`
          optionsMap[option.name]?.values.add(option.value);
        });
      }
    });
  
    // Convert the map to an array and transform the Set of values to an array
    return Object.values(optionsMap).map((option) => ({
      id: option.id,
      name: option.name,
      values: Array.from(option.values),
    }));
};

const reshapeSkusToVariants = (skus: any[]): ProductVariantType[] => {
  return skus.map((sku) => ({
    id: sku.skuId.toString(),
    title: sku.name,
    availableForSale: sku.stock?.totalStock > 0 || false,
    selectedOptions: [{ name: DEFAULT_SKU_VARIATION, value: sku.name }],
    price: {
      amount: '0',
      currencyCode: CURRENCY_CODE,
    },
  }));
}

const reshapeProductVariations = (geinsProductData: any): ProductVariantType[] => {  
  // filter out the default product from dimensions
  const dimensions = geinsProductData.variantDimensions.filter((dimension: any) => dimension.dimension !== 'DefaultProduct');  
  if(dimensions.length === 0) {    
    return reshapeSkusToVariants(geinsProductData.skus);     
  }



  const buildVariantsArray = (variants: any[], selectedOptions: any[] = [], parent: any = undefined): any[] => {
    const result: any[] = []; // Collect the final results here
  
    if (!Array.isArray(variants)) {
      return result; // Safeguard against invalid input
    }
  
    for (const variant of variants) {
      // Look ahead to check if the current variant is DefaultSku with a single value
      const hasNextLevel = Array.isArray(variant.variants) && variant.variants.length > 0;

      
     

  
      // Create the current option
      const newSelectedOptions = [...selectedOptions];
      const currentOption = {
        name: variant.dimension,
        value: variant.value,
      };
      newSelectedOptions.push(currentOption);

      

      if (hasNextLevel) {       
        const nestedResults = buildVariantsArray(variant.variants, newSelectedOptions, variant);
        result.push(...nestedResults); 
      } else {
        const hasOnlyOneOption = (parent && parent.variants.length === 1 && variant.dimension === 'DefaultSku') || false;
        if(hasOnlyOneOption) {
          newSelectedOptions.pop();
        }

        result.push({
          id: variant.skuId.toString(),
          title: newSelectedOptions.map((opt) => opt.value).join(","),
          availableForSale: variant.stock?.totalStock > 0 || false, // Handle stock availability
          selectedOptions: newSelectedOptions,
          price: {
            amount: '',
            currencyCode: CURRENCY_CODE, // Replace with actual currency code
          },
        });
      }
    
    }
  
    return result;
  };
  const reshapedVariants = buildVariantsArray(geinsProductData.variantGroup.variants);

  return reshapedVariants;
  

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
      const reshaped = reshapeProduct(data.product);
      return reshaped;
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
              sort: translateSortKey(sortKey || '', reverse || false),
              includeCollapsed: true,
              filterMode: 'CURRENT',
              searchText: query,
          }
      };

      const data = await geinsCore.graphql.query({ queryAsString: productsQuery, variables });
      if(!data || !data.products || !data.products.products) {
        return [];
      }      
      return reshapeProducts(data.products.products);
  },

  getProductRecommendations: async (geinsCore: GeinsCore, product: ProductType): Promise<any> => {
    const variables = {
      alias: product.slug,
    };
    const data = await geinsCore.graphql.query({ queryAsString: relatedProductsQuery, variables });  
    if(data?.relatedProducts && data.relatedProducts.length > 0) {
      return reshapeProducts(data.relatedProducts);      
    }
    
    if(USE_CATEGORY_FOR_RECOMMENDATIONS_BACKUP) {
      const categoryAlias = product.relations?.filter((relation: ProductRelationType) => relation.type === ProductRelationTypeEnum.CATEGORY);     
      if (categoryAlias && categoryAlias[0]) {
        return pim.getCategoryProducts(geinsCore, {category:categoryAlias[0].alias, take:4});      
      }
    }
    return [];
  },

  getCategoryProducts: async (geinsCore: GeinsCore, {
      category,
      reverse,
      sortKey,
      take,
      skip
    }: {
      category: string;
      reverse?: boolean;
      sortKey?: string;
      take?: number;
      skip?: number;
    }): Promise<any> => {
      const variables = {          
          categoryAlias: category,
          filter: {
              sort: translateSortKey(sortKey || '', reverse || false),
              includeCollapsed: false,
          },          
          ...(take && { take }),          
          ...(skip && { skip }),
      };      
      const data = await geinsCore.graphql.query({ queryAsString: productsQuery, variables, requestOptions: { fetchPolicy: 'no-cache' } });
      if(!data || !data.products || !data.products.products) {
          return [];
      }
      return reshapeProducts(data.products.products);
  }

};

export default pim;