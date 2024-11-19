import campaignFragment from './fragments/campaign';
import skuFragment from './fragments/list-product';
import metaFragment from './fragments/meta';
import priceFragment from './fragments/price';
import stockFragment from './fragments/stock';
import variantFragment from './fragments/variant';


const productQuery = /* GraphQL */ `
  query product(
    $alias: String!
    $channelId: String
    $languageId: String
    $marketId: String
  ) {
    product(
      alias: $alias
      channelId: $channelId
      languageId: $languageId
      marketId: $marketId
    ) {
      productId
      alias
      articleNumber
      canonicalUrl
      name
      meta {
        ...Meta
      }
      brand {
        name
        alias
        canonicalUrl
      }
      productImages {
        fileName
      }
      primaryCategory {
        name
        alias
        canonicalUrl
      }
      unitPrice {
        ...Price
      }
      texts {
        text1
        text2
        text3
      }
      parameterGroups {
        name
        parameterGroupId
        parameters {
          name
          value
          show
          identifier
        }
      }
      skus {
        ...Sku
      }
      totalStock {
        ...Stock
      }
      variantDimensions {
        dimension
        value
        level
        label
      }

      variantGroup {
        variants {
          variants {
            variants {
              ...Variant
            }
            ...Variant
          }
          ...Variant
        }
      }
      discountCampaigns {
        ...Campaign
      }
      rating {
        score
        voteCount
      }
    }
  
  }
  ${priceFragment}
  ${stockFragment}
  ${skuFragment}
  ${variantFragment}
  ${metaFragment}
  ${campaignFragment}
`;
export default productQuery;