import React from 'react';

export default function EcommerceHomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Headphones',
      price: '$299.99',
      image: '/placeholder-product.jpg',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: '$199.99',
      image: '/placeholder-product.jpg',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Wireless Speaker',
      price: '$149.99',
      image: '/placeholder-product.jpg',
      rating: 4.3
    }
  ];

  return (
    <div className="ecommerce-home">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to {{PROJECT_NAME_PASCAL}}</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </header>

      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-rating">
                  ★★★★★ ({product.rating})
                </div>
                <div className="product-price">{product.price}</div>
                <button className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🚚 Free Shipping</h3>
          <p>Free shipping on orders over $50</p>
        </div>
        <div className="feature">
          <h3>🔒 Secure Payment</h3>
          <p>Your payment information is safe</p>
        </div>
        <div className="feature">
          <h3>↩️ Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
      </section>
    </div>
  );
}