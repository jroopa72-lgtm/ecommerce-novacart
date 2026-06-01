const productsContainer = document.getElementById("products");
const pageBtns = document.querySelectorAll(".page-btn");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.querySelector(".sort");
const searchInput = document.getElementById("searchInput");

const pageInfo = document.getElementById("pageInfo");

let products = [];
let filteredProducts = [];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let currentPage = 1;
let perPage = 10;


// FETCH PRODUCTS
fetch("https://cdn.jsdelivr.net/gh/adarshahelvar/NovaCart/products.json")
.then(res => res.json())
.then(data => {

    products = data;
    filteredProducts = [...products];

    displayProducts();
    updateCart();
})
.catch(err => console.log(err));


// DISPLAY PRODUCTS
function displayProducts() {

    let start = (currentPage - 1) * perPage;
    let end = start + perPage;

    let pageProducts = filteredProducts.slice(start, end);

    let output = "";

    pageProducts.forEach((product) => {

        output += `
        <div class="product-card">

            <div class="product-image">

                <img
                    src="${
                        product.thumbnail ||
                        product.image ||
                        (Array.isArray(product.images)
                            ? product.images[0]
                            : 'https://via.placeholder.com/300x250?text=No+Image')
                    }"
                    alt="${product.name || product.title}"
                >

            </div>

            <div class="product-content">

                <div class="product-top">

                    <span class="product-category">
                        ${product.category || "Electronics"}
                    </span>

                    <span class="product-rating">
                        ⭐ ${product.rating ? product.rating.toFixed(1) : "4.6"}
                    </span>

                </div>

                <h3 class="product-title">
                    ${product.name || product.title}
                </h3>

                <p class="product-description">
                    ${
                        product.description
                        ? product.description.substring(0, 70) + "..."
                        : "Fitness-ready smartwatch with heart tracking, GPS, and water resistance."
                    }
                </p>

                <div class="product-bottom">

                    <div class="product-price">
                        $${product.price}
                    </div>

                    <button class="add-btn"
                        onclick="addToCart(${products.indexOf(product)})">
                        🛒 Add
                    </button>

                </div>

            </div>

        </div>
        `;
    });

    productsContainer.innerHTML = output;

    const topText = document.querySelector(".top-left p");

    if (topText) {
        topText.innerText =
            `Showing ${start + 1}-${Math.min(end, filteredProducts.length)} of ${filteredProducts.length} products`;
    }

    updatePagination();
}


// SEARCH
searchInput?.addEventListener("input", function () {

    let keyword = this.value.toLowerCase().trim();

    filteredProducts = products.filter(product => {

        let productName =
            (product.name || product.title || "")
            .toLowerCase();

        let productCategory =
            (product.category || "")
            .toLowerCase();

        return (
            productName.includes(keyword) ||
            productCategory.includes(keyword)
        );
    });

    currentPage = 1;
    displayProducts();
});

// CATEGORY FILTER
categorySelect?.addEventListener("change", function () {

    let selected = this.value.trim();

    if (selected === "All categories") {

        filteredProducts = [...products];
        perPage = 10;

    } else {

        filteredProducts = products.filter(product =>
            (product.category || "")
            .toLowerCase() === selected.toLowerCase()
        );

        perPage = 8;
    }

    currentPage = 1;
    displayProducts();
});


// SORT
sortSelect?.addEventListener("change", function () {

    if (this.value === "Price Low to High") {

        filteredProducts.sort((a, b) => a.price - b.price);

    } else if (this.value === "Price High to Low") {

        filteredProducts.sort((a, b) => b.price - a.price);
    }

    displayProducts();
});


// ADD TO CART
function addToCart(index) {

    let product = products[index];

    let existing = cart.find(item =>
        (item.name || item.title) === (product.name || product.title)
    );

    if (existing) {

        existing.qty++;

    } else {

        cart.push({
            ...product,
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();

//     alert((product.name || product.title) + " added to cart");
 }



// UPDATE CART
function updateCart() {

    let cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    let subtotal = 0;

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            `<p class="empty-cart">Cart is empty</p>`;
    }

    cart.forEach((item, index) => {

        subtotal += item.price * item.qty;

        cartItems.innerHTML += `
        <div class="cart-item">

            <img src="${
                item.thumbnail ||
                item.image ||
                (Array.isArray(item.images)
                    ? item.images[0]
                    : 'https://via.placeholder.com/80')
            }">

            <div class="cart-info">

                <h4>${item.name || item.title}</h4>

                <p>$${item.price}</p>

                <div class="qty-box">

                    <button onclick="changeQty(${index}, -1)">
                        -
                    </button>

                    <span>${item.qty}</span>

                    <button onclick="changeQty(${index}, 1)">
                        +
                    </button>

                </div>

            </div>

            <button class="remove-btn"
                onclick="removeItem(${index})">
               
                <i class="fa-solid fa-trash-can"></i>
            </button>

        </div>
        `;
    });

    // CART COUNT
    let cartCount =
        document.querySelector(".cart-count");

    if (cartCount) {

        cartCount.innerText =
            cart.reduce(
                (sum, item) => sum + item.qty,
                0
            );
    }

    // SUBTOTAL
    let subtotalElement =
        document.getElementById("subtotal");

    if (subtotalElement) {

        subtotalElement.innerText =
            "$" + subtotal.toFixed(2);
    }

    // TOTAL
    let totalElement =
        document.getElementById("total");

    if (totalElement) {

        totalElement.innerText =
            "$" + subtotal.toFixed(2);
    }
}
// OPEN CART
function openCart() {

    document
        .getElementById("cartSidebar")
        ?.classList.add("active");
}


// CLOSE CART
document.getElementById("closeCart")
?.addEventListener("click", () => {

    document
        .getElementById("cartSidebar")
        ?.classList.remove("active");
});


// CHANGE QUANTITY
function changeQty(index, value) {

    cart[index].qty += value;

    if (cart[index].qty <= 0) {

        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();
}


// REMOVE ITEM
function removeItem(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();
}


// CLEAR CART

document
.getElementById(
"clearCart"
)
.onclick=function(){

cart=[];

localStorage.removeItem(
"cart"
);

updateCart();
};

// CHECKOUT

document
.getElementById(
"checkoutBtn"
)
.onclick=function(){

window.location.href =
"login.html";

};

// PAGINATION
pageBtns.forEach(btn => {

    btn.addEventListener("click", function () {

        let text = this.innerText;

        let totalPages =
            Math.ceil(filteredProducts.length / perPage);

        if (text === "Next" && currentPage < totalPages) {

            currentPage++;

        } else if (
            text === "Previous" &&
            currentPage > 1
        ) {

            currentPage--;

        } else if (!isNaN(text)) {

            currentPage = parseInt(text);
        }

        displayProducts();
    });
});

prevBtn=document.getElementById("prev");
nextBtn=document.getElementById("next");

pageBtns.forEach(btn => {

    btn.addEventListener("click", function () {

        let totalPages =
            Math.ceil(filteredProducts.length / perPage);

        // NEXT BUTTON
        if (
            (this.id === "next" || this.innerText.trim() === "Next") &&
            currentPage < totalPages
        ) {

            currentPage++;

        }

        // PREVIOUS BUTTON
        else if (
            (this.id === "prev" || this.innerText.trim() === "Previous") &&
            currentPage > 1
        ) {

            currentPage--;

        }

        // NUMBER BUTTON
        else if (!isNaN(this.innerText)) {

            currentPage = parseInt(this.innerText);
        }

        displayProducts();
    });
});
// UPDATE PAGINATION
function updatePagination() {

    let totalPages =
        Math.ceil(filteredProducts.length / perPage);

    // REMOVE ACTIVE CLASS
    pageBtns.forEach(btn =>
        btn.classList.remove("active")
    );

    // ACTIVE PAGE
    
pageBtns.forEach(btn => {

    let pageNum = parseInt(btn.innerText);

    if (!isNaN(pageNum)) {

        if (pageNum <= totalPages) {

            btn.style.display = "inline-block";

            if (pageNum === currentPage) {
                btn.classList.add("active");
            }

        } else {

            btn.style.display = "none";
        }
    }
});
    // PAGE INFO
    if (pageInfo) {

        pageInfo.innerText =
            `Page ${currentPage} of ${totalPages}`;
    }

    // HIDE PREV BUTTON
    if (currentPage === 1) {

        prevBtn.style.display = "none";

    } else {

        prevBtn.style.display = "inline-block";
    }

    // HIDE NEXT BUTTON
    if (currentPage === totalPages) {

        nextBtn.style.display = "none";

    } else {

        nextBtn.style.display = "inline-block";
    }
}
// LOGIN
function login() {
    window.location.href = "login.html";
}


// REGISTER
function register() {
    window.location.href = "register.html";
}
