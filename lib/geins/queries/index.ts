import { default as categories } from './queries/categories.gql';
import { default as listpageMetadata } from './queries/listPageInfo.gql';
import { default as productByAlias } from './queries/product.gql';
import { default as productsByCategory } from './queries/products.gql';


const queries = {
    categories,
    listpageMetadata,
    productsByCategory,
    productByAlias
};
export { queries };

