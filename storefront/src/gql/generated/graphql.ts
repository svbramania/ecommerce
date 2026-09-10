/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddressInput = {
  /** City. */
  city?: string | null | undefined;
  /** District. */
  cityArea?: string | null | undefined;
  /** Company or organization. */
  companyName?: string | null | undefined;
  /** Country. */
  country?: CountryCode | null | undefined;
  /** State or province. */
  countryArea?: string | null | undefined;
  /** Given name. */
  firstName?: string | null | undefined;
  /** Family name. */
  lastName?: string | null | undefined;
  /**
   * Address public metadata. Can be read by any API client authorized to read the object it's attached to.
   *
   * Warning: never store sensitive information, including financial data such as credit card details.
   */
  metadata?: Array<MetadataInput> | null | undefined;
  /**
   * Phone number.
   *
   * Phone numbers are validated with Google's [libphonenumber](https://github.com/google/libphonenumber) library.
   */
  phone?: string | null | undefined;
  /** Postal code. */
  postalCode?: string | null | undefined;
  /**
   * Determine if the address should be validated. By default, Saleor accepts only address inputs matching ruleset from [Google Address Data]{https://chromium-i18n.appspot.com/ssl-address), using [i18naddress](https://github.com/mirumee/google-i18n-address) library. Some mutations may require additional permissions to use the the field. More info about permissions can be found in relevant mutation.
   *
   * Added in Saleor 3.19.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  skipValidation?: boolean | null | undefined;
  /** Address. */
  streetAddress1?: string | null | undefined;
  /** Address. */
  streetAddress2?: string | null | undefined;
};

export type CheckoutErrorCode =
  | 'BILLING_ADDRESS_NOT_SET'
  | 'CHANNEL_INACTIVE'
  | 'CHECKOUT_NOT_FULLY_PAID'
  | 'DELIVERY_METHOD_NOT_APPLICABLE'
  | 'EMAIL_NOT_SET'
  | 'GIFT_CARD_NOT_APPLICABLE'
  | 'GRAPHQL_ERROR'
  | 'INACTIVE_PAYMENT'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID'
  | 'INVALID_SHIPPING_METHOD'
  | 'MISSING_ADDRESS_DATA'
  | 'MISSING_CHANNEL_SLUG'
  | 'NON_EDITABLE_GIFT_LINE'
  | 'NON_REMOVABLE_GIFT_LINE'
  | 'NOT_FOUND'
  | 'NO_LINES'
  | 'PAYMENT_ERROR'
  | 'PRICE_OVERRIDE_REASON_WITHOUT_OVERRIDE'
  | 'PRODUCT_NOT_PUBLISHED'
  | 'PRODUCT_UNAVAILABLE_FOR_PURCHASE'
  | 'QUANTITY_GREATER_THAN_LIMIT'
  | 'REQUIRED'
  | 'SHIPPING_ADDRESS_NOT_SET'
  | 'SHIPPING_CHANGE_FORBIDDEN'
  | 'SHIPPING_METHOD_NOT_APPLICABLE'
  | 'SHIPPING_METHOD_NOT_SET'
  | 'SHIPPING_NOT_REQUIRED'
  | 'TAX_ERROR'
  | 'UNAVAILABLE_VARIANT_IN_CHANNEL'
  | 'UNIQUE'
  | 'VOUCHER_NOT_APPLICABLE'
  | 'ZERO_QUANTITY';

/**
 * Represents country codes defined by the ISO 3166-1 alpha-2 standard.
 *
 * The `EU` value is DEPRECATED and will be removed in Saleor 3.21.
 */
export type CountryCode =
  /** Andorra */
  | 'AD'
  /** United Arab Emirates */
  | 'AE'
  /** Afghanistan */
  | 'AF'
  /** Antigua and Barbuda */
  | 'AG'
  /** Anguilla */
  | 'AI'
  /** Albania */
  | 'AL'
  /** Armenia */
  | 'AM'
  /** Angola */
  | 'AO'
  /** Antarctica */
  | 'AQ'
  /** Argentina */
  | 'AR'
  /** American Samoa */
  | 'AS'
  /** Austria */
  | 'AT'
  /** Australia */
  | 'AU'
  /** Aruba */
  | 'AW'
  /** Åland Islands */
  | 'AX'
  /** Azerbaijan */
  | 'AZ'
  /** Bosnia and Herzegovina */
  | 'BA'
  /** Barbados */
  | 'BB'
  /** Bangladesh */
  | 'BD'
  /** Belgium */
  | 'BE'
  /** Burkina Faso */
  | 'BF'
  /** Bulgaria */
  | 'BG'
  /** Bahrain */
  | 'BH'
  /** Burundi */
  | 'BI'
  /** Benin */
  | 'BJ'
  /** Saint Barthélemy */
  | 'BL'
  /** Bermuda */
  | 'BM'
  /** Brunei */
  | 'BN'
  /** Bolivia */
  | 'BO'
  /** Bonaire, Sint Eustatius and Saba */
  | 'BQ'
  /** Brazil */
  | 'BR'
  /** Bahamas */
  | 'BS'
  /** Bhutan */
  | 'BT'
  /** Bouvet Island */
  | 'BV'
  /** Botswana */
  | 'BW'
  /** Belarus */
  | 'BY'
  /** Belize */
  | 'BZ'
  /** Canada */
  | 'CA'
  /** Cocos (Keeling) Islands */
  | 'CC'
  /** Congo (the Democratic Republic of the) */
  | 'CD'
  /** Central African Republic */
  | 'CF'
  /** Congo */
  | 'CG'
  /** Switzerland */
  | 'CH'
  /** Côte d'Ivoire */
  | 'CI'
  /** Cook Islands */
  | 'CK'
  /** Chile */
  | 'CL'
  /** Cameroon */
  | 'CM'
  /** China */
  | 'CN'
  /** Colombia */
  | 'CO'
  /** Costa Rica */
  | 'CR'
  /** Cuba */
  | 'CU'
  /** Cabo Verde */
  | 'CV'
  /** Curaçao */
  | 'CW'
  /** Christmas Island */
  | 'CX'
  /** Cyprus */
  | 'CY'
  /** Czechia */
  | 'CZ'
  /** Germany */
  | 'DE'
  /** Djibouti */
  | 'DJ'
  /** Denmark */
  | 'DK'
  /** Dominica */
  | 'DM'
  /** Dominican Republic */
  | 'DO'
  /** Algeria */
  | 'DZ'
  /** Ecuador */
  | 'EC'
  /** Estonia */
  | 'EE'
  /** Egypt */
  | 'EG'
  /** Western Sahara */
  | 'EH'
  /** Eritrea */
  | 'ER'
  /** Spain */
  | 'ES'
  /** Ethiopia */
  | 'ET'
  /** European Union */
  | 'EU'
  /** Finland */
  | 'FI'
  /** Fiji */
  | 'FJ'
  /** Falkland Islands (Malvinas) */
  | 'FK'
  /** Micronesia */
  | 'FM'
  /** Faroe Islands */
  | 'FO'
  /** France */
  | 'FR'
  /** Gabon */
  | 'GA'
  /** United Kingdom */
  | 'GB'
  /** Grenada */
  | 'GD'
  /** Georgia */
  | 'GE'
  /** French Guiana */
  | 'GF'
  /** Guernsey */
  | 'GG'
  /** Ghana */
  | 'GH'
  /** Gibraltar */
  | 'GI'
  /** Greenland */
  | 'GL'
  /** Gambia */
  | 'GM'
  /** Guinea */
  | 'GN'
  /** Guadeloupe */
  | 'GP'
  /** Equatorial Guinea */
  | 'GQ'
  /** Greece */
  | 'GR'
  /** South Georgia and the South Sandwich Islands */
  | 'GS'
  /** Guatemala */
  | 'GT'
  /** Guam */
  | 'GU'
  /** Guinea-Bissau */
  | 'GW'
  /** Guyana */
  | 'GY'
  /** Hong Kong */
  | 'HK'
  /** Heard Island and McDonald Islands */
  | 'HM'
  /** Honduras */
  | 'HN'
  /** Croatia */
  | 'HR'
  /** Haiti */
  | 'HT'
  /** Hungary */
  | 'HU'
  /** Indonesia */
  | 'ID'
  /** Ireland */
  | 'IE'
  /** Israel */
  | 'IL'
  /** Isle of Man */
  | 'IM'
  /** India */
  | 'IN'
  /** British Indian Ocean Territory */
  | 'IO'
  /** Iraq */
  | 'IQ'
  /** Iran */
  | 'IR'
  /** Iceland */
  | 'IS'
  /** Italy */
  | 'IT'
  /** Jersey */
  | 'JE'
  /** Jamaica */
  | 'JM'
  /** Jordan */
  | 'JO'
  /** Japan */
  | 'JP'
  /** Kenya */
  | 'KE'
  /** Kyrgyzstan */
  | 'KG'
  /** Cambodia */
  | 'KH'
  /** Kiribati */
  | 'KI'
  /** Comoros */
  | 'KM'
  /** Saint Kitts and Nevis */
  | 'KN'
  /** North Korea */
  | 'KP'
  /** South Korea */
  | 'KR'
  /** Kuwait */
  | 'KW'
  /** Cayman Islands */
  | 'KY'
  /** Kazakhstan */
  | 'KZ'
  /** Laos */
  | 'LA'
  /** Lebanon */
  | 'LB'
  /** Saint Lucia */
  | 'LC'
  /** Liechtenstein */
  | 'LI'
  /** Sri Lanka */
  | 'LK'
  /** Liberia */
  | 'LR'
  /** Lesotho */
  | 'LS'
  /** Lithuania */
  | 'LT'
  /** Luxembourg */
  | 'LU'
  /** Latvia */
  | 'LV'
  /** Libya */
  | 'LY'
  /** Morocco */
  | 'MA'
  /** Monaco */
  | 'MC'
  /** Moldova */
  | 'MD'
  /** Montenegro */
  | 'ME'
  /** Saint Martin (French part) */
  | 'MF'
  /** Madagascar */
  | 'MG'
  /** Marshall Islands */
  | 'MH'
  /** North Macedonia */
  | 'MK'
  /** Mali */
  | 'ML'
  /** Myanmar */
  | 'MM'
  /** Mongolia */
  | 'MN'
  /** Macao */
  | 'MO'
  /** Northern Mariana Islands */
  | 'MP'
  /** Martinique */
  | 'MQ'
  /** Mauritania */
  | 'MR'
  /** Montserrat */
  | 'MS'
  /** Malta */
  | 'MT'
  /** Mauritius */
  | 'MU'
  /** Maldives */
  | 'MV'
  /** Malawi */
  | 'MW'
  /** Mexico */
  | 'MX'
  /** Malaysia */
  | 'MY'
  /** Mozambique */
  | 'MZ'
  /** Namibia */
  | 'NA'
  /** New Caledonia */
  | 'NC'
  /** Niger */
  | 'NE'
  /** Norfolk Island */
  | 'NF'
  /** Nigeria */
  | 'NG'
  /** Nicaragua */
  | 'NI'
  /** Netherlands */
  | 'NL'
  /** Norway */
  | 'NO'
  /** Nepal */
  | 'NP'
  /** Nauru */
  | 'NR'
  /** Niue */
  | 'NU'
  /** New Zealand */
  | 'NZ'
  /** Oman */
  | 'OM'
  /** Panama */
  | 'PA'
  /** Peru */
  | 'PE'
  /** French Polynesia */
  | 'PF'
  /** Papua New Guinea */
  | 'PG'
  /** Philippines */
  | 'PH'
  /** Pakistan */
  | 'PK'
  /** Poland */
  | 'PL'
  /** Saint Pierre and Miquelon */
  | 'PM'
  /** Pitcairn */
  | 'PN'
  /** Puerto Rico */
  | 'PR'
  /** Palestine, State of */
  | 'PS'
  /** Portugal */
  | 'PT'
  /** Palau */
  | 'PW'
  /** Paraguay */
  | 'PY'
  /** Qatar */
  | 'QA'
  /** Réunion */
  | 'RE'
  /** Romania */
  | 'RO'
  /** Serbia */
  | 'RS'
  /** Russia */
  | 'RU'
  /** Rwanda */
  | 'RW'
  /** Saudi Arabia */
  | 'SA'
  /** Solomon Islands */
  | 'SB'
  /** Seychelles */
  | 'SC'
  /** Sudan */
  | 'SD'
  /** Sweden */
  | 'SE'
  /** Singapore */
  | 'SG'
  /** Saint Helena, Ascension and Tristan da Cunha */
  | 'SH'
  /** Slovenia */
  | 'SI'
  /** Svalbard and Jan Mayen */
  | 'SJ'
  /** Slovakia */
  | 'SK'
  /** Sierra Leone */
  | 'SL'
  /** San Marino */
  | 'SM'
  /** Senegal */
  | 'SN'
  /** Somalia */
  | 'SO'
  /** Suriname */
  | 'SR'
  /** South Sudan */
  | 'SS'
  /** Sao Tome and Principe */
  | 'ST'
  /** El Salvador */
  | 'SV'
  /** Sint Maarten (Dutch part) */
  | 'SX'
  /** Syria */
  | 'SY'
  /** Eswatini */
  | 'SZ'
  /** Turks and Caicos Islands */
  | 'TC'
  /** Chad */
  | 'TD'
  /** French Southern Territories */
  | 'TF'
  /** Togo */
  | 'TG'
  /** Thailand */
  | 'TH'
  /** Tajikistan */
  | 'TJ'
  /** Tokelau */
  | 'TK'
  /** Timor-Leste */
  | 'TL'
  /** Turkmenistan */
  | 'TM'
  /** Tunisia */
  | 'TN'
  /** Tonga */
  | 'TO'
  /** Türkiye */
  | 'TR'
  /** Trinidad and Tobago */
  | 'TT'
  /** Tuvalu */
  | 'TV'
  /** Taiwan */
  | 'TW'
  /** Tanzania */
  | 'TZ'
  /** Ukraine */
  | 'UA'
  /** Uganda */
  | 'UG'
  /** United States Minor Outlying Islands */
  | 'UM'
  /** United States of America */
  | 'US'
  /** Uruguay */
  | 'UY'
  /** Uzbekistan */
  | 'UZ'
  /** Holy See */
  | 'VA'
  /** Saint Vincent and the Grenadines */
  | 'VC'
  /** Venezuela */
  | 'VE'
  /** Virgin Islands (British) */
  | 'VG'
  /** Virgin Islands (U.S.) */
  | 'VI'
  /** Vietnam */
  | 'VN'
  /** Vanuatu */
  | 'VU'
  /** Wallis and Futuna */
  | 'WF'
  /** Samoa */
  | 'WS'
  /** Kosovo */
  | 'XK'
  /** Yemen */
  | 'YE'
  /** Mayotte */
  | 'YT'
  /** South Africa */
  | 'ZA'
  /** Zambia */
  | 'ZM'
  /** Zimbabwe */
  | 'ZW';

export type MetadataInput = {
  /** Key of a metadata item. */
  key: string;
  /** Value of a metadata item. */
  value: string;
};

export type CheckoutFieldsFragment = { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> };

export type CheckoutCreateMutationVariables = Exact<{
  channel: string;
  variantId: string | number;
  quantity: number;
}>;


export type CheckoutCreateMutation = { checkoutCreate: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutLinesAddMutationVariables = Exact<{
  checkoutId: string | number;
  variantId: string | number;
  quantity: number;
}>;


export type CheckoutLinesAddMutation = { checkoutLinesAdd: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutLinesUpdateMutationVariables = Exact<{
  checkoutId: string | number;
  lineId: string | number;
  quantity: number;
}>;


export type CheckoutLinesUpdateMutation = { checkoutLinesUpdate: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutLinesDeleteMutationVariables = Exact<{
  checkoutId: string | number;
  lineIds: Array<string | number> | string | number;
}>;


export type CheckoutLinesDeleteMutation = { checkoutLinesDelete: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutEmailUpdateMutationVariables = Exact<{
  checkoutId: string | number;
  email: string;
}>;


export type CheckoutEmailUpdateMutation = { checkoutEmailUpdate: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutShippingAddressUpdateMutationVariables = Exact<{
  checkoutId: string | number;
  address: AddressInput;
}>;


export type CheckoutShippingAddressUpdateMutation = { checkoutShippingAddressUpdate: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutDeliveryMethodUpdateMutationVariables = Exact<{
  checkoutId: string | number;
  deliveryMethodId: string | number;
}>;


export type CheckoutDeliveryMethodUpdateMutation = { checkoutDeliveryMethodUpdate: { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null, errors: Array<{ field: string | null, message: string | null, code: CheckoutErrorCode }> } | null };

export type CheckoutDetailsQueryVariables = Exact<{
  id: string | number;
}>;


export type CheckoutDetailsQuery = { checkout: { id: string, email: string | null, isShippingRequired: boolean, totalPrice: { gross: { amount: number, currency: string } }, subtotalPrice: { gross: { amount: number, currency: string } }, shippingPrice: { gross: { amount: number, currency: string } }, shippingAddress: { firstName: string, lastName: string, streetAddress1: string, city: string, postalCode: string, country: { code: string } } | null, shippingMethods: Array<{ id: string, name: string, price: { amount: number, currency: string } }>, delivery: { __typename: 'Delivery' } | null, lines: Array<{ id: string, quantity: number, totalPrice: { gross: { amount: number, currency: string } }, variant: { id: string, name: string, product: { name: string, slug: string } } }> } | null };

export type ProductDetailQueryVariables = Exact<{
  slug: string;
  channel: string;
}>;


export type ProductDetailQuery = { product: { id: string, name: string, description: unknown, thumbnail: { url: string, alt: string | null } | null, variants: Array<{ id: string, name: string, quantityAvailable: number | null, pricing: { price: { gross: { amount: number, currency: string } } | null } | null }> | null } | null };

export type ProductListQueryVariables = Exact<{
  first: number;
  channel: string;
}>;


export type ProductListQuery = { products: { totalCount: number | null, edges: Array<{ node: { id: string, name: string, slug: string, thumbnail: { url: string, alt: string | null } | null, pricing: { priceRange: { start: { gross: { amount: number, currency: string } } | null } | null } | null } }> } | null };

export type ShopInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type ShopInfoQuery = { shop: { name: string, description: string | null, defaultCountry: { code: string } | null } };

export const CheckoutFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutFieldsFragment, unknown>;
export const CheckoutCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lines"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"variantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}]}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutCreateMutation, CheckoutCreateMutationVariables>;
export const CheckoutLinesAddDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutLinesAdd"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lines"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"variantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutLinesAddMutation, CheckoutLinesAddMutationVariables>;
export const CheckoutLinesUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutLinesUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lines"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutLinesUpdateMutation, CheckoutLinesUpdateMutationVariables>;
export const CheckoutLinesDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutLinesDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lineIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"linesIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lineIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutLinesDeleteMutation, CheckoutLinesDeleteMutationVariables>;
export const CheckoutEmailUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutEmailUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutEmailUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutEmailUpdateMutation, CheckoutEmailUpdateMutationVariables>;
export const CheckoutShippingAddressUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutShippingAddressUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutShippingAddressUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"shippingAddress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutShippingAddressUpdateMutation, CheckoutShippingAddressUpdateMutationVariables>;
export const CheckoutDeliveryMethodUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutDeliveryMethodUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deliveryMethodId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryMethodUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}},{"kind":"Argument","name":{"kind":"Name","value":"deliveryMethodId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deliveryMethodId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutDeliveryMethodUpdateMutation, CheckoutDeliveryMethodUpdateMutationVariables>;
export const CheckoutDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CheckoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CheckoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"delivery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutDetailsQuery, CheckoutDetailsQueryVariables>;
export const ProductDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"pricing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductDetailQuery, ProductDetailQueryVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pricing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const ShopInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShopInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCountry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<ShopInfoQuery, ShopInfoQueryVariables>;