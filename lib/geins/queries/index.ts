import { default as categoriesQuery } from './queries/categories';
import { default as listPageInfoQuery } from './queries/listPageInfo';
import { default as productQuery } from './queries/product';
import { default as productsQuery } from './queries/products';


const queries = {
    categories: categoriesQuery,
    listpageMetadata: listPageInfoQuery,
    productsByCategory: productsQuery,
    productByAlias: productQuery,
};
export { queries };

