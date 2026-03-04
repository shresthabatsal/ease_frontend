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
      GET_ONE: (id: string) => `/api/admin/stores/${id}`,
      CREATE: "/api/admin/stores",
      UPDATE: (id: string) => `/api/admin/stores/${id}`,
      DELETE: (id: string) => `/api/admin/stores/${id}`,
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

    // Admin order router is mounted at /api/admin
    ORDERS: {
      GET_BY_STORE: (storeId: string) => `/api/admin/stores/${storeId}/orders`,
      GET_ONE: (orderId: string) => `/api/admin/${orderId}`,
      UPDATE_STATUS: (orderId: string) => `/api/admin/orders/${orderId}/status`,
      VERIFY_OTP: (orderId: string) =>
        `/api/admin/orders/${orderId}/verify-otp`,
      DELETE: (orderId: string) => `/api/admin/orders/${orderId}`,
    },

    // Admin payment router is mounted at /api/admin/payments
    PAYMENTS: {
      GET_ALL: "/api/admin/payments",
      GET_ONE: (paymentId: string) => `/api/admin/payments/${paymentId}`,
      // Note: /pending route conflicts with /:paymentId — use GET_ALL with status=PENDING filter instead
      VERIFY: (paymentId: string) => `/api/admin/payments/${paymentId}/verify`, // PUT
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
      GET_NEAREST: "/api/user/stores/nearest/by-location",
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
      GET_ALL: "/api/user/notifications",
      GET_UNREAD_COUNT: "/api/user/notifications/unread/count",
      MARK_READ: (id: string) => `/api/user/notifications/${id}/read`,
      MARK_ALL_READ: "/api/user/notifications/mark-all/read",
      DELETE: (id: string) => `/api/user/notifications/${id}`,
    },

    SUPPORT: {
      TICKETS: {
        CREATE: "/api/support/tickets",
        GET_MY: "/api/support/tickets/my-tickets",
        GET_ONE: (id: string) => `/api/support/tickets/${id}`,
        CLOSE: (id: string) => `/api/support/tickets/${id}/close`,
      },
      ADMIN_TICKETS: {
        GET_OPEN: "/api/support/tickets/admin/open-tickets",
        GET_MINE: "/api/support/tickets/admin/my-tickets",
        ASSIGN: (id: string) => `/api/support/tickets/${id}/assign`,
        UPDATE_STATUS: (id: string) => `/api/support/tickets/${id}/status`,
      },
      MESSAGES: {
        SEND: "/api/support/messages",
        GET: (ticketId: string) => `/api/support/messages/${ticketId}`,
      },
    },

    // Cart
    CART: {
      GET: "/api/user/cart",
      ADD: "/api/user/cart",
      UPDATE: (cartItemId: string) => `/api/user/cart/${cartItemId}`,
      REMOVE: (cartItemId: string) => `/api/user/cart/${cartItemId}`,
      CLEAR: "/api/user/cart", // DELETE / with no body = clearCart
    },
  },
};
