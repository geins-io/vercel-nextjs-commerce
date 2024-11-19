import priceFragment from "./price.gql";
import stockFragment from './stock';

const listProductFragment = /* GraphQL */ `
  fragment ListProduct on ProductType {
    brand {
      name
    }
    name
    productId
    articleNumber
    alias
    canonicalUrl
    unitPrice {
      ...Price
    }
    productImages {
      fileName
    }
    primaryCategory {
      name
    }
    totalStock {
      ...Stock
    }

  }
  ${priceFragment}
  ${stockFragment}
`;
export default listProductFragment;