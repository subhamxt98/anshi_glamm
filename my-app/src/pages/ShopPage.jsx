import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "./css/shop.css";

const ShopPage = () => {
  const { addToCart, getCartCount, getSubtotal } = useCart();

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Products from Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Aapka backend URL (Check karein ki .env mein sahi hai ya nahi)
        const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const { data } = await axios.get(`${backendURL}/items`);
        
        console.log("Backend Data:", data); // Debugging ke liye

        if (data && data.length > 0) {
          const formattedData = data.map((item) => ({
            id: item._id,
            name: item.name,
            category: item.category,
            price: item.price,
            oldPrice: item.oldPrice || item.price,
            rating: item.rating || 4.5,
            reviews: item.reviews || 0,
            image: item.image,
            badge: item.badge || "",
          }));
          setProducts(formattedData);
        } else {
          setProducts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["All", "Lips", "Eyes", "Face", "Skincare", "Hair", "Body", "Nails"];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }

    return result;
  }, [products, selectedCategory, priceRange, sortBy, searchQuery, minRating]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 5000]);
    setSortBy("featured");
    setSearchQuery("");
    setMinRating(0);
  };

  // Loading & Error States
  if (loading) {
    return (
      <div className="shop-page d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <h3>Loading Collection...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page d-flex justify-content-center align-items-center text-danger" style={{ minHeight: "60vh" }}>
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="container py-5">
        {/* HEADER */}
        <div className="shop-header text-center mb-5">
          <span className="section-label">Shop Collection</span>
          <h1 className="shop-title">
            Discover Your <span className="italic">Beauty</span>
          </h1>
          <p className="shop-desc mx-auto" style={{ maxWidth: "600px" }}>
            Explore our premium range of cosmetics crafted for the modern woman.
          </p>
        </div>

        {/* SEARCH + SORT */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-lg-6">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div className="col-lg-3 col-md-6">
            <button className="filter-toggle-btn w-100" onClick={() => setShowFilters(!showFilters)}>
              <i className="bi bi-funnel"></i> Filters
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* SIDEBAR */}
          <div className={`col-lg-3 ${showFilters ? "d-block" : "d-none d-lg-block"}`}>
            <div className="filters-panel">
              <div className="filter-group">
                <h4 className="filter-heading">Category</h4>
                <div className="filter-categories">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`filter-cat-btn ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                      <span className="filter-cat-count">
                        {cat === "All" ? products.length : products.filter((p) => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>
                <i className="bi bi-arrow-counterclockwise"></i> Clear All Filters
              </button>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="col-lg-9">
            <div className="results-header">
              <p className="results-count">
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-results">
                <i className="bi bi-search"></i>
                <h3>No products found</h3>
                <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredProducts.map((product) => (
                  <div className="col-6 col-md-4" key={product.id}>
                    <ShopProductCard product={product} onAddToCart={addToCart} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ShopProductCard = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.id}`} className="shop-product-card d-block">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating d-flex align-items-center gap-2">
          <i className="bi bi-star-fill"></i>
          <span>{product.rating}</span>
          <span className="product-reviews">({product.reviews})</span>
        </div>
        <div className="product-price-row d-flex align-items-center gap-2 mb-3">
          <span className="product-price">₹{product.price.toLocaleString("en-IN")}</span>
          <span className="product-old-price">₹{product.oldPrice.toLocaleString("en-IN")}</span>
        </div>
        <button className={`add-to-cart-btn ${added ? "added" : ""}`} onClick={handleAdd}>
          {added ? <><i className="bi bi-check2"></i> Added</> : <><i className="bi bi-bag-plus"></i> Add to Cart</>}
        </button>
      </div>
    </Link>
  );
};

export default ShopPage;