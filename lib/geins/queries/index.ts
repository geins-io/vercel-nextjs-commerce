import categoriesQuery from './queries/categories';
import listPageInfoQuery from './queries/listPageInfo';
import productQuery from './queries/product';
import productsQuery from './queries/products';


const queries = {
    categories: categoriesQuery,
    listpageMetadata: listPageInfoQuery,
    productsByCategory: productsQuery,
    productByAlias: productQuery,
    productQuery,
};
export { queries };

