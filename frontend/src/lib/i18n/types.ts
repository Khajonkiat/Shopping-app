export type Locale = "en" | "th";

export interface Translations {
  nav: {
    dashboard: string;
    products: string;
    stores: string;
    purchases: string;
  };
  common: {
    loading: string;
    cancel: string;
    delete: string;
    edit: string;
    save: string;
    create: string;
    optional: string;
    dash: string;
    // form labels
    name: string;
    category: string;
    unit: string;
    description: string;
    store: string;
    product: string;
    price: string;
    date: string;
    qty: string;
    total: string;
    notes: string;
    source: string;
    baseUrl: string;
    // select placeholders
    selectStore: string;
    selectProduct: string;
  };
  dashboard: {
    title: string;
    recordsSuffix: string;
    totalSuffix: string;
    recentPurchases: string;
    viewAll: string;
    noData: string;
    recordLink: string;
    col: {
      product: string;
      store: string;
      price: string;
      qty: string;
      total: string;
      date: string;
    };
  };
  products: {
    title: string;
    addButton: string;
    categoryPlaceholder: string;
    unitPlaceholder: string;
    noData: string;
    confirmDelete: string;
  };
  productDetail: {
    back: string;
    cheapest: string;
    pricesTab: string;
    purchasesTab: string;
    imagesTab: string;
    recordPrice: string;
    recordPurchase: string;
    noPrices: string;
    noPurchases: string;
    noImages: string;
    uploadImage: string;
    sourceManual: string;
    sourceScraped: string;
  };
  stores: {
    title: string;
    addButton: string;
    namePlaceholder: string;
    noData: string;
    confirmDelete: string;
  };
  purchases: {
    title: string;
    recordButton: string;
    recordsSuffix: string;
    totalSuffix: string;
    noData: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    username: string;
    password: string;
    loginTitle: string;
    registerTitle: string;
    noAccount: string;
    hasAccount: string;
    loginError: string;
    registerError: string;
  };
}
