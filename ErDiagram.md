# E-Commerce Platform - Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ WISHLISTS : creates
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--|| CART : owns

    CART ||--o{ CART_ITEMS : contains
    CART_ITEMS }o--|| PRODUCTS : references

    PRODUCTS ||--o{ CART_ITEMS : added_to
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS }o--|| CATEGORIES : belongs_to
    PRODUCTS ||--o{ WISHLISTS : wishlisted_by

    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--|| PAYMENTS : has
    ORDERS }o--|| ADDRESSES : ships_to

    ORDER_ITEMS }o--|| PRODUCTS : contains

    REVIEWS }o--|| PRODUCTS : reviews

    WISHLISTS }o--|| PRODUCTS : contains

    PAYMENTS ||--|| PAYMENT_GATEWAYS : uses

    ADMINS ||--o{ PRODUCTS : manages
    ADMINS ||--o{ COUPONS : manages
    ADMINS ||--o{ ORDERS : monitors

    USERS {
        int user_id PK
        string name
        string email UK
        string password
        string phone
        datetime created_at
        datetime updated_at
    }

    ADDRESSES {
        int address_id PK
        int user_id FK
        string street
        string city
        string state
        string country
        string zip_code
        boolean is_default
    }

    CATEGORIES {
        int category_id PK
        string name
        string description
    }

    PRODUCTS {
        int product_id PK
        int category_id FK
        string name
        string description
        decimal price
        int stock
        float rating
        string image_url
        datetime created_at
    }

    CART {
        int cart_id PK
        int user_id FK
        datetime created_at
        datetime updated_at
    }

    CART_ITEMS {
        int cart_item_id PK
        int cart_id FK
        int product_id FK
        int quantity
        decimal price
    }

    ORDERS {
        int order_id PK
        int user_id FK
        int address_id FK
        int payment_id FK
        decimal total_amount
        string status
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEMS {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }

    PAYMENTS {
        int payment_id PK
        int order_id FK
        decimal amount
        string payment_method
        string status
        string transaction_id
        datetime created_at
    }

    PAYMENT_GATEWAYS {
        int gateway_id PK
        string provider_name
        string api_key
    }

    REVIEWS {
        int review_id PK
        int product_id FK
        int user_id FK
        int rating
        string comment
        datetime created_at
    }

    WISHLISTS {
        int wishlist_id PK
        int user_id FK
        int product_id FK
        datetime created_at
    }

    COUPONS {
        int coupon_id PK
        string code UK
        decimal discount
        datetime expiry_date
        int usage_limit
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK
        string type
        string message
        string status
        datetime created_at
    }

    ADMINS {
        int admin_id PK
        string name
        string email UK
        string password
        string role
    }
```

## Entity Descriptions

### USERS
Stores customer information including authentication credentials and contact details.
- **Primary Key**: user_id
- **Unique Key**: email
- **Relationships**: Has multiple addresses, places orders, writes reviews, creates wishlists, receives notifications

### ADDRESSES
Stores multiple delivery addresses for each user.
- **Primary Key**: address_id
- **Foreign Key**: user_id
- **Special Attributes**: is_default (boolean to mark preferred address)

### CATEGORIES
Product categories for organizing the catalog.
- **Primary Key**: category_id
- **Relationships**: One category has many products

### PRODUCTS
Core product catalog with pricing and inventory.
- **Primary Key**: product_id
- **Foreign Key**: category_id
- **Relationships**: Can be in carts, orders, wishlists, and have reviews

### CART
Temporary shopping cart for each user.
- **Primary Key**: cart_id
- **Foreign Key**: user_id
- **Unique Constraint**: One cart per user

### CART_ITEMS
Individual items in a shopping cart.
- **Primary Key**: cart_item_id
- **Foreign Keys**: cart_id, product_id
- **Attributes**: quantity, price (for historical tracking)

### ORDERS
Completed purchase orders with status tracking.
- **Primary Key**: order_id
- **Foreign Keys**: user_id, address_id, payment_id
- **Attributes**: total_amount, status (pending, shipped, delivered, cancelled)

### ORDER_ITEMS
Individual products included in an order.
- **Primary Key**: order_item_id
- **Foreign Keys**: order_id, product_id
- **Attributes**: quantity, price (snapshot of price at purchase time)

### PAYMENTS
Payment transaction details and status.
- **Primary Key**: payment_id
- **Foreign Key**: order_id, gateway_id
- **Attributes**: amount, payment_method, status, transaction_id

### PAYMENT_GATEWAYS
External payment providers (Stripe, PayPal, etc.).
- **Primary Key**: gateway_id
- **Attributes**: provider_name, api_key

### REVIEWS
Customer product reviews and ratings.
- **Primary Key**: review_id
- **Foreign Keys**: product_id, user_id
- **Relationships**: Each product can have multiple reviews from different users

### WISHLISTS
Bookmarked products for future purchase.
- **Primary Key**: wishlist_id
- **Foreign Keys**: user_id, product_id

### COUPONS
Discount codes and promotional offers.
- **Primary Key**: coupon_id
- **Unique Key**: code
- **Attributes**: discount (percentage or fixed amount), expiry_date, usage_limit

### NOTIFICATIONS
System notifications for order updates and promotions.
- **Primary Key**: notification_id
- **Foreign Key**: user_id
- **Attributes**: type (order_update, promotion, etc.), status (read/unread)

### ADMINS
Administrative users with management capabilities.
- **Primary Key**: admin_id
- **Unique Key**: email
- **Attributes**: role (super_admin, product_manager, order_manager)

## Relationship Types

- **Solid Lines (Identifying)**: Strong dependencies where child entity cannot exist without parent
- **Dashed Lines (Non-identifying)**: Weak relationships where entities can exist independently

## Key Cardinalities

- **1:N (One-to-Many)**: User has many orders, product has many reviews
- **1:1 (One-to-One)**: User has one cart, order has one payment
- **N:M (Many-to-Many)**: Resolved through junction tables (CART_ITEMS, ORDER_ITEMS)
