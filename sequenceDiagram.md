# E-Commerce Platform - Sequence Diagrams

## 1. User Registration and Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enter registration details
    Frontend->>Backend: POST /register (name, email, password)
    activate Backend
    Backend->>Backend: Hash password
    Backend->>Database: Insert user record
    activate Database
    Database-->>Backend: User created (user_id)
    deactivate Database
    Backend-->>Frontend: Registration successful
    deactivate Backend
    Backend->>User: Send verification email
    User->>Backend: Verify email (click link)
    Backend-->>User: Email verified
    Frontend-->>User: Account created successfully

    User->>Frontend: Enter login credentials
    Frontend->>Backend: POST /login (email, password)
    activate Backend
    Backend->>Database: Query user by email
    activate Database
    Database-->>Backend: User record
    deactivate Database
    Backend->>Backend: Verify password
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: Login successful + Token
    deactivate Backend
    Frontend-->>User: Redirect to dashboard
```

## 2. Product Browsing and Search Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant Cache

    User->>Frontend: Browse products by category
    Frontend->>Backend: GET /products?category=Electronics
    activate Backend
    Backend->>Cache: Check cache for products
    alt Cache Hit
        Cache-->>Backend: Return cached products
    else Cache Miss
        Backend->>Database: Query products by category
        activate Database
        Database-->>Backend: Product list
        deactivate Database
        Backend->>Cache: Store in cache
    end
    Backend-->>Frontend: Product data with images
    deactivate Backend
    Frontend-->>User: Display product catalog

    User->>Frontend: Search for product
    Frontend->>Backend: GET /search?query=laptop
    activate Backend
    Backend->>Database: Full-text search query
    activate Database
    Database-->>Backend: Matching products
    deactivate Database
    Backend-->>Frontend: Search results
    deactivate Backend
    Frontend-->>User: Display search results
```

## 3. Shopping Cart Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Click "Add to Cart"
    Frontend->>Frontend: Get product details
    Frontend->>Backend: POST /cart/add (user_id, product_id, quantity)
    activate Backend
    Backend->>Database: Check product availability
    activate Database
    Database-->>Backend: Stock info
    deactivate Database
    alt Stock Available
        Backend->>Database: Insert/Update cart item
        Database-->>Backend: Item added
    else Out of Stock
        Backend-->>Frontend: Stock unavailable error
    end
    deactivate Backend
    Frontend-->>User: Product added to cart

    User->>Frontend: View cart
    Frontend->>Backend: GET /cart (user_id)
    activate Backend
    Backend->>Database: Query cart items with product details
    activate Database
    Database-->>Backend: Cart data
    deactivate Database
    Backend->>Backend: Calculate total price
    Backend-->>Frontend: Cart contents + total
    deactivate Backend
    Frontend-->>User: Display cart items and total

    User->>Frontend: Update quantity
    Frontend->>Backend: PUT /cart/item (cart_item_id, new_quantity)
    activate Backend
    Backend->>Database: Update quantity
    Database-->>Backend: Updated
    Backend-->>Frontend: New total price
    deactivate Backend
    Frontend-->>User: Cart updated
```

## 4. Checkout and Payment Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant PaymentGateway
    participant Database

    User->>Frontend: Proceed to checkout
    Frontend->>Backend: POST /checkout (user_id, address_id)
    activate Backend
    Backend->>Database: Validate address
    activate Database
    Database-->>Backend: Address verified
    deactivate Database
    Backend-->>Frontend: Checkout form
    deactivate Backend
    Frontend-->>User: Show payment options

    User->>Frontend: Apply Coupon (enter code)
    Frontend->>Backend: POST /coupon/apply (code, cart_total)
    activate Backend
    Backend->>Database: Validate coupon
    Database-->>Backend: Coupon details
    Backend-->>Frontend: Discount applied + New total
    deactivate Backend
    Frontend-->>User: Update order summary

    User->>Frontend: Select payment method
    Frontend->>Frontend: Enter payment details
    Frontend->>Backend: POST /payment/process (order_details, payment_method)
    activate Backend
    Backend->>Backend: Create order (pending status)
    Backend->>Database: Insert order record
    Database-->>Backend: Order ID generated
    
    alt Payment Method = Card
        Backend->>PaymentGateway: Process payment (token, amount)
        activate PaymentGateway
        PaymentGateway-->>Backend: Payment authorized + transaction_id
        deactivate PaymentGateway
    else Payment Method = UPI/Digital Wallet
        Backend->>PaymentGateway: Initiate UPI transaction
        activate PaymentGateway
        PaymentGateway-->>Backend: Awaiting user confirmation
        User->>PaymentGateway: Confirm payment
        PaymentGateway-->>Backend: Payment confirmed
        deactivate PaymentGateway
    end
    
    Backend->>Database: Update payment status (success)
    Database-->>Backend: Payment recorded
    Backend->>Database: Update order status (confirmed)
    Database-->>Backend: Order confirmed
    Backend->>Database: Reduce product stock
    Database-->>Backend: Stock updated
    Backend->>Backend: Generate Invoice
    Backend->>Database: Store Invoice
    Backend-->>Frontend: Order confirmation + Invoice
    deactivate Backend
    Frontend-->>User: Show order confirmation with receipt/invoice
```

## 5. Order Tracking Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OrderService
    participant Database

    User->>Frontend: Click "Track Order"
    Frontend->>Backend: GET /orders (user_id)
    activate Backend
    Backend->>Database: Query user orders
    activate Database
    Database-->>Backend: Order list
    deactivate Database
    Backend-->>Frontend: Order details
    deactivate Backend
    Frontend-->>User: Display orders

    User->>Frontend: View order details
    Frontend->>Backend: GET /orders/{order_id}
    activate Backend
    Backend->>Database: Query order with items
    activate Database
    Database-->>Backend: Order data
    deactivate Database
    Backend-->>Frontend: Order details + items
    deactivate Backend
    Frontend-->>User: Show order status and timeline

    loop Every 5 minutes
        Backend->>OrderService: Get shipment status
        activate OrderService
        OrderService-->>Backend: Current tracking info
        deactivate OrderService
        Backend->>Database: Update order status
        Database-->>Backend: Status updated
        Backend->>Backend: Send notification to user
    end
```

## 6. Product Review and Rating Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Open delivered order
    Frontend->>User: Show "Write Review" option
    User->>Frontend: Click write review
    Frontend-->>User: Display review form

    User->>Frontend: Enter rating and comment
    Frontend->>Backend: POST /reviews (user_id, product_id, rating, comment)
    activate Backend
    Backend->>Database: Check if user purchased product
    activate Database
    Database-->>Backend: Purchase verified
    deactivate Database
    
    alt First review for product
        Backend->>Database: Insert review
        Database-->>Backend: Review created
    else Duplicate review
        Backend->>Database: Update existing review
        Database-->>Backend: Review updated
    end
    
    Backend->>Database: Calculate new average rating
    activate Database
    Database-->>Backend: Updated rating
    deactivate Database
    Backend->>Database: Update product rating
    Database-->>Backend: Product updated
    Backend-->>Frontend: Review submitted successfully
    deactivate Backend
    Frontend-->>User: Show confirmation
```

## 7. Product Return and Refund Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Initiate Return (order_id, reason)
    Frontend->>Backend: POST /returns (order_id, items, reason)
    activate Backend
    Backend->>Database: Check return window/eligibility
    Database-->>Backend: Eligible
    Backend->>Database: Update order status (return_initiated)
    Backend-->>Frontend: Return request accepted
    deactivate Backend

    Note right of Backend: After items are received/inspected

    Admin->>Backend: Approve Refund (return_id)
    activate Backend
    Backend->>Database: Update order status (refunded)
    Backend->>Database: Update Wallet balance (credit)
    Backend->>Database: Update product stock (re-stock)
    Backend-->>User: Refund confirmation
    deactivate Backend
```

## 8. Wishlist Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: View product details
    Frontend->>User: Show "Add to Wishlist" button
    User->>Frontend: Click "Add to Wishlist"
    Frontend->>Backend: POST /wishlist (user_id, product_id)
    activate Backend
    Backend->>Database: Check if already in wishlist
    activate Database
    Database-->>Backend: Wishlist check result
    deactivate Database
    
    alt Not in wishlist
        Backend->>Database: Insert wishlist item
        Database-->>Backend: Item added
        Backend-->>Frontend: Added to wishlist
    else Already in wishlist
        Backend-->>Frontend: Already in wishlist
    end
    deactivate Backend
    Frontend-->>User: Show confirmation

    User->>Frontend: View wishlist
    Frontend->>Backend: GET /wishlist (user_id)
    activate Backend
    Backend->>Database: Query wishlist items with product details
    activate Database
    Database-->>Backend: Wishlist data
    deactivate Database
    Backend-->>Frontend: Wishlist contents
    deactivate Backend
    Frontend-->>User: Display wishlist items

    User->>Frontend: Move item to cart
    Frontend->>Backend: POST /wishlist/to-cart (wishlist_id)
    activate Backend
    Backend->>Database: Get product details
    Backend->>Database: Add to cart
    Backend->>Database: Remove from wishlist
    Backend-->>Frontend: Item moved to cart
    deactivate Backend
    Frontend-->>User: Confirm action
```

## 8. Admin Product Management Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Login to admin panel
    Frontend->>Backend: POST /admin/login
    activate Backend
    Backend->>Database: Verify admin credentials
    Database-->>Backend: Admin verified
    Backend-->>Frontend: Admin session
    deactivate Backend
    Frontend-->>Admin: Show admin dashboard

    Admin->>Frontend: Add new product
    Frontend-->>Admin: Display product form
    Admin->>Frontend: Fill product details
    Frontend->>Backend: POST /admin/products (name, price, stock, category_id, description, image)
    activate Backend
    Backend->>Database: Validate category exists
    Backend->>Database: Insert product
    Database-->>Backend: Product created (product_id)
    Backend-->>Frontend: Product added successfully
    deactivate Backend
    Frontend-->>Admin: Show confirmation with product_id

    Admin->>Frontend: Update product stock
    Frontend->>Backend: PUT /admin/products/{product_id}/stock (new_stock)
    activate Backend
    Backend->>Database: Update stock quantity
    Database-->>Backend: Stock updated
    Backend-->>Frontend: Stock updated
    deactivate Backend
    Frontend-->>Admin: Confirm update

## 10. Admin Reports and Analytics Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Click "Generate Sales Report"
    Frontend->>Backend: GET /admin/reports/sales?period=monthly
    activate Backend
    Backend->>Database: Aggregate sales data
    Database-->>Backend: Statistics
    Backend->>Backend: Format Report (PDF/CSV)
    Backend-->>Frontend: Report URL
    deactivate Backend
    Frontend-->>Admin: Show Download Link

    Admin->>Frontend: View Dashboard KPIs
    Frontend->>Backend: GET /admin/analytics/kpis
    activate Backend
    Backend->>Database: Fetch latest analytics
    Database-->>Backend: KPI metrics
    Backend-->>Frontend: KPI JSON
    deactivate Backend
    Frontend-->>Admin: Render charts and graphs
```

## Key Interactions Summary
```

## Key Interactions Summary

1. **Registration & Login**: Users create accounts and authenticate via JWT tokens
2. **Product Discovery**: Users browse and search products with caching for performance
3. **Cart Management**: Items are added/removed with real-time stock validation
4. **Payment Processing**: Secure payment processing with multiple payment methods
5. **Order Tracking**: Real-time order status updates with notifications
6. **Reviews**: Users can rate products after delivery
7. **Wishlist**: Products saved for future purchase
8. **Admin Operations**: Administrators manage inventory and products
