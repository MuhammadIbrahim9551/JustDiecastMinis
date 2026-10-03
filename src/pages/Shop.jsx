import {
  useMemo,
  useState,
  useEffect,
  useRef
} from "react";

import {
  useSearchParams,
  Link
} from "react-router-dom";

import "../App.css";
import Reveal from "../components/Reveal";
import imageUrl from "../utils/imageUrl";

const PRODUCTS_PER_PAGE = 21;

function Shop({
  cart,
  setCart,
  wishlist,
  setWishlist
}) {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [catalogOptions, setCatalogOptions] = useState({
    scales: [
      "1:64",
      "1:43",
      "1:32",
      "1:24",
      "1:18"
    ],

    // Model makers are loaded from Admin/localStorage.
    // These are only the fallback defaults.
    modelMakers: [
      "Hot Wheels",
      "Tomica",
      "Mini GT",
      "Kyosho",
      "Bburago",
      "Majorette",
      "M2 Machines",
      "CCA",
      "Others"
    ],

    vehicleMakers: [
      "Toyota",
      "Nissan",
      "Honda",
      "Mazda",
      "Subaru",
      "Mitsubishi",
      "Isuzu",
      "Suzuki",
      "Daihatsu",
      "Lexus",
      "Acura",
      "Infiniti",
      "GR",
      "BMW",
      "Porsche",
      "Ferrari",
      "Lamborghini",
      "Lancia",
      "Alfa Romeo",
      "Ford",
      "Chevrolet",
      "Jeep",
      "GMC",
      "Mercedes Benz",
      "Volkswagen",
      "Audi",
      "Jaguar",
      "Bugatti",
      "Koenigsegg",
      "Pagani",
      "Fiat",
      "Mini",
      "Peugeot",
      "Lotus",
      "Renault",
      "Citroen",
      "Bentley",
      "Aston Martin",
      "Maserati",
      "McLaren",
      "Pontiac",
      "Cadillac",
      "Rolls Royce",
      "Dodge",
      "Chrysler",
      "Plymouth",
      "Tata",
      "Mahindra",
      "Holden",
      "Saab",
      "Skoda",
      "Seat",
      "Hyundai",
      "Genesis",
      "Kia",
      "Others"
    ],

    types: [
      "JDM",
      "GTs",
      "Coupes",
      "Hatches",
      "Sedans",
      "Estates",
      "Supercars",
      "Classics",
      "Race Cars",
      "Rally",
      "Kei Cars",
      "Vintage",
      "SUVs",
      "MPVs",
      "Trucks",
      "Vans",
      "Motorcycles",
      "Others"
    ]
  });

  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");

  const searchInputRef = useRef(null);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [preOrderProduct, setPreOrderProduct] =
    useState(null);

  const [preOrderSubmitted, setPreOrderSubmitted] =
    useState(false);

  const [interestName, setInterestName] =
    useState("");

  const [interestEmail, setInterestEmail] =
    useState("");

  const [interestLoading, setInterestLoading] =
    useState(false);

  const [interestError, setInterestError] =
    useState("");

  // Always start Shop on page 1.
  const [currentPage, setCurrentPage] = useState(1);

  // Remembers the previous Shop filter/search/sort state.
  const previousShopFilterKey = useRef(null);

  // Remembers the previous page.
  const previousShopPage = useRef(currentPage);

  // Always start at the top whenever Shop is visited.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top whenever the user changes Shop pages.
  useEffect(() => {
    if (previousShopPage.current !== currentPage) {
      window.scrollTo(0, 0);
    }

    previousShopPage.current = currentPage;
  }, [currentPage]);

  // Load catalog options from Admin/localStorage.
  useEffect(() => {
    const loadCatalogOptions = () => {
      try {
        const savedOptions =
          localStorage.getItem(
            "jdm_catalog_options"
          );

        if (savedOptions) {
          const parsedOptions =
            JSON.parse(savedOptions);

          setCatalogOptions((current) => ({
            ...current,
            ...parsedOptions
          }));
        }
      } catch (error) {
        console.error(
          "Unable to load catalog options.",
          error
        );
      }
    };

    loadCatalogOptions();

    window.addEventListener(
      "jdm-catalog-change",
      loadCatalogOptions
    );

    window.addEventListener(
      "storage",
      loadCatalogOptions
    );

    return () => {
      window.removeEventListener(
        "jdm-catalog-change",
        loadCatalogOptions
      );

      window.removeEventListener(
        "storage",
        loadCatalogOptions
      );
    };
  }, []);

  // Load products.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products."
          );
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Read search parameter.
  useEffect(() => {
    const searchParam =
      searchParams.get("search");

    if (searchParam !== null) {
      setSearch(searchParam);

      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    } else {
      setSearch("");
    }
  }, [searchParams]);

  const brand =
    searchParams.get("brand");

  const scale =
    searchParams.get("scale");

  const category =
    searchParams.get("category");

  const type =
    searchParams.get("type");

  const vehicleMaker =
    searchParams.get("maker");

  const series =
    searchParams.get("series");

  const availability =
    searchParams.get("availability");

  // Identifies the Shop view excluding page number.
  const shopFilterKey =
    `${searchParams.toString()}|search=${encodeURIComponent(
      search
    )}|sort=${sort}`;

  // Reset pagination whenever the Shop view changes.
  useEffect(() => {
    if (previousShopFilterKey.current === null) {
      previousShopFilterKey.current =
        shopFilterKey;

      return;
    }

    if (
      previousShopFilterKey.current !==
      shopFilterKey
    ) {
      setCurrentPage(1);

      previousShopFilterKey.current =
        shopFilterKey;
    }
  }, [shopFilterKey]);

  const normalizeValue = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const getVehicleMakers = (product) => {
    if (
      Array.isArray(product.vehicleMaker)
    ) {
      return product.vehicleMaker
        .map((maker) =>
          String(maker).trim()
        )
        .filter(Boolean);
    }

    if (
      typeof product.vehicleMaker === "string" &&
      product.vehicleMaker.trim()
    ) {
      return [
        product.vehicleMaker.trim()
      ];
    }

    return [];
  };

  const isOtherOption = (
    value,
    listedOptions = []
  ) => {
    const normalizedValue =
      normalizeValue(value);

    const normalizedListedOptions =
      listedOptions
        .filter(
          (option) =>
            normalizeValue(option) !==
            "others"
        )
        .map((option) =>
          normalizeValue(option)
        );

    return !normalizedListedOptions.includes(
      normalizedValue
    );
  };

  // Determines whether a product is out of stock.
  const isOutOfStock = (product) => {
    const stock =
      Number.isInteger(product.stock)
        ? product.stock
        : 0;

    return (
      product.status === "out-of-stock" ||
      (
        product.status === "in-stock" &&
        stock === 0
      )
    );
  };

  // Availability counts are based on the entire catalogue.
  const availabilityCounts = useMemo(() => {
    const counts = {
      available: 0,
      outOfStock: 0,
      preOrder: 0
    };

    products.forEach((product) => {
      const stock =
        Number.isInteger(product.stock)
          ? product.stock
          : 0;

      if (
        product.status === "pre-order"
      ) {
        counts.preOrder += 1;
        return;
      }

      if (
        product.status === "out-of-stock" ||
        (
          product.status === "in-stock" &&
          stock === 0
        )
      ) {
        counts.outOfStock += 1;
        return;
      }

      if (
        product.status === "in-stock" &&
        stock > 0
      ) {
        counts.available += 1;
      }
    });

    return counts;
  }, [products]);

  // Filter products.
  const filteredProducts = useMemo(() => {
    const filtered =
      products.filter((product) => {
        const searchTerm =
          search.toLowerCase().trim();

        const productTypes =
          Array.isArray(product.type)
            ? product.type
            : [];

        const matchesSearch =
          !searchTerm ||
          String(product.name ?? "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(product.brand ?? "")
            .toLowerCase()
            .includes(searchTerm) ||
          getVehicleMakers(product).some(
            (maker) =>
              normalizeValue(maker).includes(
                searchTerm
              )
          ) ||
          String(product.scale ?? "")
            .toLowerCase()
            .includes(searchTerm) ||
          productTypes.some((item) =>
            String(item)
              .toLowerCase()
              .includes(searchTerm)
          );

        if (!matchesSearch) {
          return false;
        }

        // MODEL MAKER FILTER
        if (brand === "Others") {
          if (
            !isOtherOption(
              product.brand,
              catalogOptions.modelMakers
            )
          ) {
            return false;
          }
        } else if (
          brand &&
          normalizeValue(product.brand) !==
            normalizeValue(brand)
        ) {
          return false;
        }

        // SCALE FILTER
        if (scale === "Others") {
          if (
            !isOtherOption(
              product.scale,
              catalogOptions.scales
            )
          ) {
            return false;
          }
        } else if (
          scale &&
          normalizeValue(product.scale) !==
            normalizeValue(scale)
        ) {
          return false;
        }

        // CATEGORY FILTER
        if (
          category &&
          normalizeValue(product.category) !==
            normalizeValue(category)
        ) {
          return false;
        }

        // TYPE FILTER
        if (type === "Others") {
          const hasOtherType =
            productTypes.length === 0 ||
            productTypes.some((item) =>
              isOtherOption(
                item,
                catalogOptions.types
              )
            );

          if (!hasOtherType) {
            return false;
          }
        } else if (
          type &&
          !productTypes.some(
            (item) =>
              normalizeValue(item) ===
              normalizeValue(type)
          )
        ) {
          return false;
        }

        // VEHICLE MAKER FILTER
        const productVehicleMakers =
          getVehicleMakers(product);

        if (vehicleMaker === "Others") {
          const hasOtherVehicleMaker =
            productVehicleMakers.some(
              (maker) =>
                isOtherOption(
                  maker,
                  catalogOptions.vehicleMakers
                )
            );

          if (!hasOtherVehicleMaker) {
            return false;
          }
        } else if (
          vehicleMaker &&
          !productVehicleMakers.some(
            (maker) =>
              normalizeValue(maker) ===
              normalizeValue(vehicleMaker)
          )
        ) {
          return false;
        }

        // SERIES FILTER
        if (
          series &&
          normalizeValue(product.series) !==
            normalizeValue(series)
        ) {
          return false;
        }

        // AVAILABILITY FILTER
        if (
          availability === "available"
        ) {
          const stock =
            Number.isInteger(product.stock)
              ? product.stock
              : 0;

          if (
            product.status !== "in-stock" ||
            stock <= 0
          ) {
            return false;
          }
        }

        if (
          availability === "out-of-stock"
        ) {
          if (!isOutOfStock(product)) {
            return false;
          }
        }

        if (
          availability === "pre-order"
        ) {
          if (
            product.status !== "pre-order"
          ) {
            return false;
          }
        }

        return true;
      });

    // SORTING
if (sort === "price-low") {
  return [...filtered].sort(
    (a, b) => a.price - b.price
  );
}

if (sort === "price-high") {
  return [...filtered].sort(
    (a, b) => b.price - a.price
  );
}

// Default: newest products first
return [...filtered].sort(
  (a, b) =>
    new Date(b.createdAt || 0) -
    new Date(a.createdAt || 0)
);
  }, [
    products,
    search,
    brand,
    scale,
    category,
    type,
    vehicleMaker,
    series,
    availability,
    sort,
    catalogOptions
  ]);

  const totalPages =
    Math.ceil(
      filteredProducts.length /
        PRODUCTS_PER_PAGE
    );

  const paginatedProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      PRODUCTS_PER_PAGE;

    return filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );
  }, [
    filteredProducts,
    currentPage
  ]);

  // If filtering leaves us beyond the last page,
  // move to the last available page.
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages
  ]);

  // Update a filter.
  const updateFilter = (
    key,
    value
  ) => {
    const params =
      new URLSearchParams(searchParams);

    if (
      params.get(key) === value
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    setSearchParams(params);
  };

  // Clear all filters.
  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters =
    brand ||
    scale ||
    category ||
    type ||
    vehicleMaker ||
    series ||
    availability;

  // Add to cart.
  const addToCart = (product) => {
    if (
      product.status !== "in-stock"
    ) {
      return;
    }

    const stock =
      Number.isInteger(product.stock)
        ? product.stock
        : 0;

    if (stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      const currentQuantity =
        existingItem
          ? existingItem.quantity
          : 0;

      if (
        currentQuantity >= stock
      ) {
        return currentCart;
      }

      if (existingItem) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    currentQuantity + 1,
                  stock
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
          stock
        }
      ];
    });
  };

  // Wishlist.
  const toggleWishlist = (
    product
  ) => {
    setWishlist(
      (currentWishlist) => {
        const exists =
          currentWishlist.some(
            (item) =>
              item.id === product.id
          );

        if (exists) {
          return currentWishlist.filter(
            (item) =>
              item.id !== product.id
          );
        }

        return [
          ...currentWishlist,
          product
        ];
      }
    );
  };

  // Stock label.
  const getStockLabel = (
    product
  ) => {
    const stock =
      Number.isInteger(product.stock)
        ? product.stock
        : 0;

    if (
      product.status ===
        "out-of-stock" ||
      stock === 0
    ) {
      return "OUT OF STOCK";
    }

    if (stock === 1) {
      return "ONLY 1 LEFT";
    }

    if (stock === 2) {
      return "ONLY 2 LEFT";
    }

    return "IN STOCK";
  };

  // Pre-order interest submission.
  const handleInterestSubmit =
    async (e) => {
      e.preventDefault();

      setInterestLoading(true);
      setInterestError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/interests`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              productId:
                preOrderProduct.id,
              customerName:
                interestName,
              customerEmail:
                interestEmail
            })
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to register interest."
          );
        }

        setPreOrderSubmitted(true);
        setInterestName("");
        setInterestEmail("");
      } catch (error) {
        setInterestError(
          error.message
        );
      } finally {
        setInterestLoading(false);
      }
    };

  // Loading state.
  if (loading) {
    return (
      <main className="shop-page">
        <div className="shop-loading">
          LOADING MODELS...
        </div>
      </main>
    );
  }

  // Error state.
  if (error) {
    return (
      <main className="shop-page">
        <div className="shop-loading">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="shop-page">

      <Reveal>
        <section className="shop-header">
          <p className="eyebrow">
            THE COLLECTION
          </p>

          <h1>SHOP</h1>

          <p>
            Find your next miniature dream car.
          </p>
        </section>
      </Reveal>

      <section className="shop-content">

        <button
          className="mobile-filter-toggle"
          onClick={() =>
            setFiltersOpen(
              (open) => !open
            )
          }
        >
          <span>FILTERS</span>

          <span>
            {filtersOpen
              ? "−"
              : "+"}
          </span>
        </button>

        <aside
          className={`shop-filters ${
            filtersOpen
              ? "filters-open"
              : ""
          }`}
        >

          <div className="filter-heading">
            <h3>FILTERS</h3>

            {hasFilters && (
              <button
                onClick={clearFilters}
              >
                CLEAR ALL
              </button>
            )}
          </div>

          {/* CATEGORY */}

          <div className="filter-group">
            <h4>CATEGORY</h4>

            {[
              [
                "New Arrivals",
                "new-arrivals"
              ],
              [
                "Pre-Orders",
                "pre-orders"
              ],
              [
                "Best Sellers",
                "best-sellers"
              ],
              [
                "Featured",
                "featured"
              ],
              [
                "Sale",
                "sale"
              ]
            ].map(
              ([label, value]) => (
                <button
                  key={value}
                  className={
                    category === value
                      ? "active-filter"
                      : ""
                  }
                  onClick={() =>
                    updateFilter(
                      "category",
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* AVAILABILITY */}

          <div className="filter-group">
            <h4>AVAILABILITY</h4>

            <button
              className={
                availability ===
                "available"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                updateFilter(
                  "availability",
                  "available"
                )
              }
            >
              <span>AVAILABLE</span>

              <span>
                {
                  availabilityCounts.available
                }
              </span>
            </button>

            <button
              className={
                availability ===
                "out-of-stock"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                updateFilter(
                  "availability",
                  "out-of-stock"
                )
              }
            >
              <span>
                OUT OF STOCK
              </span>

              <span>
                {
                  availabilityCounts.outOfStock
                }
              </span>
            </button>

            <button
              className={
                availability ===
                "pre-order"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                updateFilter(
                  "availability",
                  "pre-order"
                )
              }
            >
              <span>PRE-ORDER</span>

              <span>
                {
                  availabilityCounts.preOrder
                }
              </span>
            </button>
          </div>

          {/* TYPE */}

          <div className="filter-group">
            <h4>TYPE</h4>

            {catalogOptions.types.map(
              (item) => (
                <button
                  key={item}
                  className={
                    type === item
                      ? "active-filter"
                      : ""
                  }
                  onClick={() =>
                    updateFilter(
                      "type",
                      item
                    )
                  }
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* MODEL MAKER */}

          <div className="filter-group">
            <h4>MODEL MAKER</h4>

            {catalogOptions.modelMakers.map(
              (maker) => (
                <button
                  key={maker}
                  className={
                    brand === maker
                      ? "active-filter"
                      : ""
                  }
                  onClick={() =>
                    updateFilter(
                      "brand",
                      maker
                    )
                  }
                >
                  {maker}
                </button>
              )
            )}

            <button
              className={
                brand === "Others"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                updateFilter(
                  "brand",
                  "Others"
                )
              }
            >
              Others
            </button>
          </div>

          {/* SCALE */}

          <div className="filter-group">
            <h4>SCALE</h4>

            {catalogOptions.scales.map(
              (item) => (
                <button
                  key={item}
                  className={
                    scale === item
                      ? "active-filter"
                      : ""
                  }
                  onClick={() =>
                    updateFilter(
                      "scale",
                      item
                    )
                  }
                >
                  {item}
                </button>
              )
            )}

            <button
              className={
                scale === "Others"
                  ? "active-filter"
                  : ""
              }
              onClick={() =>
                updateFilter(
                  "scale",
                  "Others"
                )
              }
            >
              Others
            </button>
          </div>

          {/* VEHICLE MAKER */}

          <div className="filter-group">
            <h4>VEHICLE MAKER</h4>

            <div className="shop-vehicle-makers-scroll">
              {catalogOptions.vehicleMakers.map(
                (maker) => (
                  <button
                    key={maker}
                    className={
                      vehicleMaker ===
                      maker
                        ? "active-filter"
                        : ""
                    }
                    onClick={() =>
                      updateFilter(
                        "maker",
                        maker
                      )
                    }
                  >
                    {maker}
                  </button>
                )
              )}

              <button
                className={
                  vehicleMaker ===
                  "Others"
                    ? "active-filter"
                    : ""
                }
                onClick={() =>
                  updateFilter(
                    "maker",
                    "Others"
                  )
                }
              >
                Others
              </button>
            </div>
          </div>

        </aside>

        <div className="shop-main">

          <div className="shop-toolbar">

            <div className="shop-search">

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setSearch(value);

                  const params =
                    new URLSearchParams(
                      searchParams
                    );

                  if (value.trim()) {
                    params.set(
                      "search",
                      value
                    );
                  } else {
                    params.delete(
                      "search"
                    );
                  }

                  setSearchParams(
                    params
                  );
                }}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");

                    const params =
                      new URLSearchParams(
                        searchParams
                      );

                    params.delete(
                      "search"
                    );

                    setSearchParams(
                      params
                    );
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            <p>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "MODEL"
                : "MODELS"}
            </p>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>

          </div>

          {filteredProducts.length > 0 ? (

            <div className="product-grid">

              {paginatedProducts.map(
                (product) => {
                  const outOfStock =
                    isOutOfStock(
                      product
                    );

                  const cartItem =
                    cart.find(
                      (item) =>
                        item.id ===
                        product.id
                    );

                  const cartQuantity =
                    cartItem
                      ? cartItem.quantity
                      : 0;

                  const stock =
                    Number.isInteger(
                      product.stock
                    )
                      ? product.stock
                      : 0;

                  const cartLimitReached =
                    product.status ===
                      "in-stock" &&
                    stock > 0 &&
                    cartQuantity >=
                      stock;

                  const isWishlisted =
                    wishlist.some(
                      (item) =>
                        item.id ===
                        product.id
                    );

                  return (
                    <div
                      key={product.id}
                      className="product-card"
                    >

                      <Link
                        to={`/product/${product.id}`}
                        className="product-card-main"
                      >

                        <div className="product-card-image">

                          <img
                            src={imageUrl(
                              product.images?.[0]
                            )}
                            alt={product.name}
                          />

                          <span
                            className={`product-status product-status-${
                              outOfStock
                                ? "out-of-stock"
                                : product.status
                            }`}
                          >
                            {product.status ===
                            "pre-order"
                              ? "PRE-ORDER"
                              : getStockLabel(
                                  product
                                )}
                          </span>

                        </div>

                        <div className="product-card-info">

                          <p className="product-card-brand">
                            {product.brand}
                          </p>

                          <h3>
                            {product.name}
                          </h3>

                          <div className="product-card-meta">
                            <span>
                              {product.scale}
                            </span>
                          </div>

                          <div className="product-card-bottom">
                            <strong>
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>

                        </div>

                      </Link>

                      <button
                        className={`product-wishlist ${
                          isWishlisted
                            ? "wishlisted"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          toggleWishlist(
                            product
                          );
                        }}
                        aria-label="Add to wishlist"
                      >
                        {isWishlisted
                          ? "♥"
                          : "♡"}
                      </button>

                      <button
                        className={`product-card-cart ${
                          outOfStock ||
                          cartLimitReached
                            ? "cart-disabled"
                            : ""
                        }`}
                        disabled={
                          outOfStock ||
                          cartLimitReached
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (
                            product.status ===
                            "pre-order"
                          ) {
                            setPreOrderProduct(
                              product
                            );

                            setPreOrderSubmitted(
                              false
                            );

                            setInterestName(
                              ""
                            );

                            setInterestEmail(
                              ""
                            );

                            setInterestError(
                              ""
                            );

                            setInterestLoading(
                              false
                            );

                            return;
                          }

                          if (
                            product.status ===
                              "in-stock" &&
                            !outOfStock &&
                            !cartLimitReached
                          ) {
                            addToCart(
                              product
                            );
                          }
                        }}
                      >
                        {product.status ===
                        "pre-order"
                          ? "PRE-ORDER"
                          : outOfStock
                          ? "OUT OF STOCK"
                          : cartLimitReached
                          ? "ALREADY IN CART"
                          : "ADD TO CART"}
                      </button>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="no-products">
              <h2>
                No models found.
              </h2>

              <p>
                Try another category or manufacturer.
              </p>
            </div>

          )}

          {totalPages > 1 && (
            <div className="shop-pagination">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page - 1
                  )
                }
              >
                PREVIOUS
              </button>

              <div className="shop-pagination-pages">

                {Array.from(
                  {
                    length: totalPages
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage ===
                      page
                        ? "active-page"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                  >
                    {page}
                  </button>
                ))}

              </div>

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page + 1
                  )
                }
              >
                NEXT
              </button>

            </div>
          )}

        </div>
      </section>

      {/* PRE-ORDER MODAL */}

      {preOrderProduct && (
        <div
          className="preorder-overlay"
          onClick={() => {
            setPreOrderProduct(null);
            setPreOrderSubmitted(false);
          }}
        >

          <div
            className="preorder-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="preorder-close"
              onClick={() => {
                setPreOrderProduct(null);
                setPreOrderSubmitted(false);
              }}
              aria-label="Close"
            >
              ×
            </button>

            {!preOrderSubmitted ? (

              <>
                <p className="eyebrow">
                  PRE-ORDER
                </p>

                <h2>
                  {preOrderProduct.name}
                </h2>

                <p className="preorder-description">
                  This model isn't currently
                  in stock. Register your
                  interest and we'll let you
                  know when it becomes
                  available.
                </p>

                <form
                  className="preorder-form"
                  onSubmit={
                    handleInterestSubmit
                  }
                >

                  <input
                    type="text"
                    placeholder="Your name"
                    value={
                      interestName
                    }
                    onChange={(e) => {
                      setInterestName(
                        e.target.value
                      );

                      setInterestError(
                        ""
                      );
                    }}
                    required
                    disabled={
                      interestLoading
                    }
                  />

                  <input
                    type="email"
                    placeholder="Your email"
                    value={
                      interestEmail
                    }
                    onChange={(e) => {
                      setInterestEmail(
                        e.target.value
                      );

                      setInterestError(
                        ""
                      );
                    }}
                    required
                    disabled={
                      interestLoading
                    }
                  />

                  {interestError && (
                    <p className="preorder-error">
                      {interestError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={
                      interestLoading
                    }
                  >
                    {interestLoading
                      ? "REGISTERING..."
                      : "REGISTER INTEREST"}
                  </button>

                </form>
              </>

            ) : (

              <div className="preorder-success">

                <p className="eyebrow">
                  INTEREST REGISTERED
                </p>

                <h2>
                  You're on the list.
                </h2>

                <p className="preorder-description">
                  Thanks for your interest in{" "}
                  {preOrderProduct.name}.
                  We'll contact you when this
                  model becomes available.
                </p>

                <button
                  className="preorder-success-button"
                  onClick={() => {
                    setPreOrderProduct(
                      null
                    );

                    setPreOrderSubmitted(
                      false
                    );
                  }}
                >
                  CLOSE
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </main>
  );
}

export default Shop;
