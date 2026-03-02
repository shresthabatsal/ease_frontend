export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/update-profile",
    UPLOAD_PROFILE_PIC: "/api/auth/upload-profile-picture",
    DELETE_ACCOUNT: "/api/auth/delete-account",
    REQUEST_PASSWORD_RESET: "/api/auth/request-password-reset",
    RESET_PASSWORD: "/api/auth/reset-password",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  ADMIN: {
    USERS: {
      GET_ALL: "/api/admin/users",
      GET_ONE: (id: string) => `/api/admin/users/${id}`,
      CREATE: "/api/admin/users",
      UPDATE: (id: string) => `/api/admin/users/${id}`,
      DELETE: (id: string) => `/api/admin/users/${id}`,
    },

    PRODUCTS: {
      GET_ALL: "/api/admin/products",
      GET_ONE: (productId: string) => `/api/admin/products/${productId}`,
      GET_BY_STORE: (storeId: string) => `/api/admin/products/store/${storeId}`,
      CREATE: "/api/admin/products",
      UPDATE: (productId: string) => `/api/admin/products/${productId}`,
      DELETE: (productId: string) => `/api/admin/products/${productId}`,
    },

    STORES: {
      GET_ALL: "/api/admin/stores",
    },

    CATEGORIES: {
      GET_ALL: "/api/admin/categories",
      GET_ONE: (id: string) => `/api/admin/categories/${id}`,
      CREATE: "/api/admin/categories",
      UPDATE: (id: string) => `/api/admin/categories/${id}`,
      DELETE: (id: string) => `/api/admin/categories/${id}`,
    },

    SUBCATEGORIES: {
      GET_ALL: "/api/admin/subcategories",
      GET_ONE: (id: string) => `/api/admin/subcategories/${id}`,
      GET_BY_CATEGORY: (categoryId: string) =>
        `/api/admin/subcategories/category/${categoryId}`,
      CREATE: "/api/admin/subcategories",
      UPDATE: (id: string) => `/api/admin/subcategories/${id}`,
      DELETE: (id: string) => `/api/admin/subcategories/${id}`,
    },

    ORDERS: {
      GET_BY_STORE: (storeId: string) => `/api/admin/stores/${storeId}/orders`,
      GET_ONE: (orderId: string) => `/api/admin/${orderId}`,
      UPDATE_STATUS: (orderId: string) => `/api/admin/orders/${orderId}/status`,
      VERIFY_OTP: (orderId: string) =>
        `/api/admin/orders/${orderId}/verify-otp`,
      DELETE: (orderId: string) => `/api/admin/orders/${orderId}`,
    },

    PAYMENTS: {
      GET_ALL: "/api/admin/payments",
      GET_ONE: (paymentId: string) => `/api/admin/payments/${paymentId}`,
      VERIFY: (paymentId: string) => `/api/admin/payments/${paymentId}/verify`,
    },
  },

  PUBLIC: {
    ORDERS: {
      CREATE: "/api/user/orders",
      BUY_NOW: "/api/user/orders/buy-now",
      GET_ALL: "/api/user/orders",
      GET_ONE: (orderId: string) => `/api/user/orders/${orderId}`,
      CANCEL: (orderId: string) => `/api/user/orders/${orderId}/cancel`,
    },

    PAYMENTS: {
      SUBMIT_RECEIPT: "/api/user/payments/submit-receipt",
      GET_ORDER_PAYMENT: (orderId: string) =>
        `/api/user/payments/order/${orderId}`,
      GET_MY_PAYMENTS: "/api/user/payments",
    },

    STORES: {
      GET_ALL: "/api/user/stores",
      GET_ONE: (storeId: string) => `/api/user/stores/${storeId}`,
    },

    CATEGORIES: {
      GET_ALL: "/api/user/categories",
      GET_ONE: (categoryId: string) => `/api/user/categories/${categoryId}`,
    },

    PRODUCTS: {
      GET_ONE: (productId: string) => `/api/products/${productId}`,
      GET_BY_STORE: (storeId: string) => `/api/products/store/${storeId}`,
      GET_BY_STORE_AND_CATEGORY: (storeId: string, categoryId: string) =>
        `/api/products/store/${storeId}/category/${categoryId}`,
      GET_BY_STORE_AND_SUBCATEGORY: (storeId: string, subcategoryId: string) =>
        `/api/products/store/${storeId}/subcategory/${subcategoryId}`,
    },
    RATINGS: {
      GET_BY_PRODUCT: (productId: string) =>
        `/api/user/ratings/product/${productId}`,
      CREATE: "/api/user/ratings",
      UPDATE: (ratingId: string) => `/api/user/ratings/${ratingId}`,
      DELETE: (ratingId: string) => `/api/user/ratings/${ratingId}`,
    },
    NOTIFICATIONS: {
      GET_ALL: "/api/user/notification",
      GET_UNREAD_COUNT: "/api/user/notification/unread/count",
      MARK_READ: (id: string) => `/api/user/notification/${id}/read`,
      MARK_ALL_READ: "/api/user/notification/mark-all/read",
      DELETE: (id: string) => `/api/user/notification/${id}`,
    },

    // Cart
    CART: {
      GET: "/api/user/cart",
      ADD: "/api/user/cart",
      UPDATE: (cartItemId: string) => `/api/user/cart/${cartItemId}`,
      REMOVE: (cartItemId: string) => `/api/user/cart/${cartItemId}`,
      CLEAR: "/api/user/cart",
    },
  },
};
