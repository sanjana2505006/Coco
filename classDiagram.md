# E-Commerce Platform - Class Diagram

```mermaid
classDiagram
    class User {
        -userId: int
        -name: string
        -email: string
        -password: string
        -phone: string
        -createdAt: datetime
        -updatedAt: datetime
        +register()
        +login()
        +updateProfile()
        +logout()
        +viewWallet()
    }

    class Address {
        -addressId: int
        -userId: int
        -street: string
        -city: string
        -state: string
        -country: string
        -zipCode: string
        -isDefault: boolean
        +addAddress()
        +updateAddress()
        +deleteAddress()
    }

    class Product {
        -productId: int
        -categoryId: int
        -name: string
        -description: string
        -price: decimal
        -stock: int
        -rating: float
        -image: string
        -createdAt: datetime
        +getDetails()
        +updatePrice()
        +updateStock()
    }

    class Category {
        -categoryId: int
        -name: string
        -description: string
        +getProducts()
        +addCategory()
        +deleteCategory()
    }

    class Cart {
        -cartId: int
        -userId: int
        -createdAt: datetime
        -updatedAt: datetime
        +addItem()
        +removeItem()
        +updateQuantity()
        +getTotal()
        +clear()
    }

    class CartItem {
        -cartItemId: int
        -cartId: int
        -productId: int
        -quantity: int
        -price: decimal
        +updateQuantity()
        +remove()
    }

    class Order {
        -orderId: int
        -userId: int
        -addressId: int
        -paymentId: int
        -updatedAt: datetime
        -couponCode: string
        -invoiceId: string
        +placeOrder()
        +cancelOrder()
        +updateStatus()
        +getOrderDetails()
    }

    class OrderItem {
        -orderItemId: int
        -orderId: int
        -productId: int
        -quantity: int
        -price: decimal
    }

    class Payment {
        -paymentId: int
        -orderId: int
        -amount: decimal
        -paymentMethod: string
        -status: string
        -transactionId: string
        -createdAt: datetime
        +processPayment()
        +refund()
        +getStatus()
    }

    class Review {
        -reviewId: int
        -productId: int
        -userId: int
        -rating: int
        -comment: string
        -createdAt: datetime
        +submitReview()
        +updateReview()
        +deleteReview()
    }

    class Wishlist {
        -wishlistId: int
        -userId: int
        -productId: int
        -createdAt: datetime
        +addToWishlist()
        +removeFromWishlist()
        +getWishlistItems()
    }

    class Coupon {
        -couponId: int
        -code: string
        -discount: decimal
        -expiryDate: datetime
        -usageLimit: int
        +applyCoupon()
        +validateCoupon()
        +getDiscount()
    }

    class Admin {
        -adminId: int
        -name: string
        -email: string
        -role: string
        +manageProducts()
        +manageUsers()
        +manageOrders()
        +viewAnalytics()
        +manageCoupons()
    }

    class Notification {
        -notificationId: int
        -userId: int
        -type: string
        -message: string
        -status: string
        -createdAt: datetime
        +sendNotification()
        +markAsRead()
        +deleteNotification()
    }

    class Wallet {
        -walletId: int
        -userId: int
        -balance: decimal
        +addFunds()
        +deductFunds()
        +getBalance()
    }

    class Report {
        -reportId: int
        -type: string
        -content: string
        -generatedAt: datetime
        +generate()
        +export()
    }

    class Analytics {
        -kpiId: int
        -metricName: string
        -value: float
        +getStats()
        +updateKPI()
    }

    class Payment_Gateway {
        -gatewayId: int
        -providerName: string
        -apiKey: string
        +validatePayment()
        +processTransaction()
        +handleCallback()
    }

    %% Relationships
    User "1" --> "*" Address : has
    User "1" --> "1" Cart : owns
    User "1" --> "*" Order : places
    User "1" --> "*" Review : writes
    User "1" --> "*" Wishlist : creates
    User "1" --> "*" Notification : receives
    User "1" --> "1" Wallet : has

    Cart "1" --> "*" CartItem : contains
    CartItem "*" --> "1" Product : references

    Product "1" --> "*" CartItem : added to
    Product "1" --> "*" OrderItem : included in
    Product "1" --> "*" Review : has
    Product "*" --> "1" Category : belongs to
    Product "1" --> "*" Wishlist : wishlisted by

    Order "1" --> "*" OrderItem : contains
    Order "1" --> "1" Payment : has
    Order "*" --> "1" Address : ships to

    OrderItem "*" --> "1" Product : contains

    Review "*" --> "1" Product : reviews

    Wishlist "*" --> "1" Product : contains

    Payment "1" --> "1" Payment_Gateway : uses

    Admin "1" --> "*" Product : manages
    Admin "1" --> "*" Coupon : manages
    Admin "1" --> "*" Order : monitors
    Admin "1" --> "*" Report : generates
    Admin "1" --> "1" Analytics : views
```

## Class Descriptions

### User
Represents a customer in the system with authentication and profile management capabilities.

### Address
Stores multiple delivery addresses for each user.

### Product
Core entity representing items available for purchase with pricing and inventory details.

### Category
Groups products into logical categories for easy browsing.

### Cart
Temporary shopping cart for each user containing selected items before checkout.

### CartItem
Individual items within a shopping cart with quantity and pricing.

### Order
Represents a completed purchase with order status tracking.

### OrderItem
Individual products included in an order.

### Payment
Handles payment processing and transaction tracking.

### Review
Customer reviews and ratings for products.

### Wishlist
Allows users to save products for future purchase.

### Coupon
Discount codes that can be applied to orders.

### Admin
Administrative user with privileges to manage products, users, and orders.

### Notification
System for sending order updates and promotional messages to users.

### Wallet
Digital wallet for users to store balance and make payments.

### Report
Structured data document generated for business analysis.

### Analytics
Real-time performance metrics and KPIs for the platform.

### Payment_Gateway
Integration with external payment providers for secure transaction processing.
