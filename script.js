/* =====================================================
   SACHIN MOBILE WEBSITE
   DATABASE-FREE PRODUCT MANAGEMENT
   Uses Browser LocalStorage
===================================================== */


/* =====================================================
   DEFAULT PRODUCTS
===================================================== */

const defaultProducts = [

    {
        id: 1,

        name: "iPhone 12",

        price: 28999,

        condition: "Excellent",

        status: "available",

        image:
        "https://images.unsplash.com/photo-1592286927505-2fd6f2f9f7f0?auto=format&fit=crop&w=600&q=80",

        details:
        "128GB | Clean Condition"
    },


    {
        id: 2,

        name: "Samsung Galaxy S21",

        price: 21999,

        condition: "Good",

        status: "available",

        image:
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",

        details:
        "128GB | 8GB RAM"
    },


    {
        id: 3,

        name: "OnePlus 9",

        price: 17999,

        condition: "Good",

        status: "available",

        image:
        "https://images.unsplash.com/photo-1632633173522-3c8d0d7d8f96?auto=format&fit=crop&w=600&q=80",

        details:
        "128GB | 8GB RAM"
    }

];


/* =====================================================
   GET PRODUCTS
===================================================== */

function getProducts() {

    const products =
        localStorage.getItem("sachinProducts");

    if(products) {

        return JSON.parse(products);

    }

    localStorage.setItem(
        "sachinProducts",
        JSON.stringify(defaultProducts)
    );

    return defaultProducts;
}


/* =====================================================
   SAVE PRODUCTS
===================================================== */

function saveProducts(products) {

    localStorage.setItem(
        "sachinProducts",
        JSON.stringify(products)
    );

}


/* =====================================================
   SHOW PRODUCTS ON HOME PAGE
===================================================== */

function displayProducts(search = "") {

    const container =
        document.getElementById("mobileProducts");

    if(!container) return;


    const products = getProducts();


    const filtered =
        products.filter(product => {

            return product.name
            .toLowerCase()
            .includes(search.toLowerCase());

        });


    container.innerHTML = "";


    if(filtered.length === 0) {

        container.innerHTML = `

            <div class="no-products">

                <h2>No Mobile Found</h2>

                <p>
                    This mobile is currently not available.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(product => {

        const card =
        document.createElement("div");

        card.className = "product-card";


        const statusClass =
            product.status === "available"
            ? "available"
            : "sold";


        const statusText =
            product.status === "available"
            ? "AVAILABLE"
            : "SOLD";


        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.src='https://via.placeholder.com/600x600?text=No+Image'"
                >

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </div>


            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <p class="details">
                    ${product.details}
                </p>

                <p class="condition">
                    Condition:
                    <b>${product.condition}</b>
                </p>


                <div class="product-bottom">

                    <strong>
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    ${
                        product.status === "available"

                        ?

                        `
                        <a
                            href="https://wa.me/917719042356?text=I%20am%20interested%20in%20${encodeURIComponent(product.name)}"
                            target="_blank"
                            class="interest-btn">

                            Enquire

                        </a>
                        `

                        :

                        `
                        <button
                            class="sold-btn"
                            disabled>

                            Sold Out

                        </button>
                        `
                    }

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
    document.getElementById("searchInput");


if(searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            displayProducts(
                this.value
            );

        }
    );

}


/* =====================================================
   DISPLAY PRODUCTS
===================================================== */

displayProducts();


/* =====================================================
   OWNER LOGIN CHECK
===================================================== */

if(
    window.location.pathname.includes("owner.html")
) {

    const loggedIn =
        localStorage.getItem(
            "ownerLoggedIn"
        );


    if(loggedIn !== "true") {

        window.location.href =
            "login.html";

    }

}


/* =====================================================
   OWNER PRODUCT LIST
===================================================== */

function displayAdminProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );


    if(!container) return;


    const products =
        getProducts();


    container.innerHTML = "";


    if(products.length === 0) {

        container.innerHTML = `
            <div class="empty-admin">
                No products available.
            </div>
        `;

        return;

    }


    products.forEach(product => {

        const item =
            document.createElement("div");


        item.className =
            "admin-product";


        item.innerHTML = `

            <img
                src="${product.image}"
                onerror="this.src='https://via.placeholder.com/150?text=No+Image'"
            >


            <div class="admin-product-info">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ₹${Number(product.price).toLocaleString("en-IN")}
                </p>

                <span>
                    ${product.condition}
                </span>

                <b class="${product.status}">
                    ${product.status}
                </b>

            </div>


            <div class="admin-actions">

                <button
                    onclick="editProduct(${product.id})"
                    class="edit-btn">

                    Edit

                </button>


                <button
                    onclick="deleteProduct(${product.id})"
                    class="delete-btn">

                    Delete

                </button>


                <button
                    onclick="toggleStatus(${product.id})"
                    class="status-btn">

                    ${
                        product.status === "available"
                        ? "Mark Sold"
                        : "Make Available"
                    }

                </button>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =====================================================
   ADD / EDIT PRODUCT
===================================================== */

const productForm =
    document.getElementById(
        "productForm"
    );


if(productForm) {

    productForm.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const editId =
                document.getElementById(
                    "editId"
                ).value;


            const product = {

                id:
                    editId
                    ? Number(editId)
                    : Date.now(),

                name:
                    document.getElementById(
                        "productName"
                    ).value,

                price:
                    Number(
                        document.getElementById(
                            "productPrice"
                        ).value
                    ),

                condition:
                    document.getElementById(
                        "productCondition"
                    ).value,

                status:
                    document.getElementById(
                        "productStatus"
                    ).value,

                image:
                    document.getElementById(
                        "productImage"
                    ).value
                    ||
                    "https://via.placeholder.com/600x600?text=Mobile",

                details:
                    document.getElementById(
                        "productDetails"
                    ).value

            };


            let products =
                getProducts();


            /* EDIT */

            if(editId) {

                products =
                    products.map(p => {

                        return p.id === Number(editId)
                            ? product
                            : p;

                    });


                alert(
                    "Product updated successfully!"
                );

            }


            /* ADD */

            else {

                products.unshift(
                    product
                );

                alert(
                    "Product added successfully!"
                );

            }


            saveProducts(products);


            resetForm();

            displayAdminProducts();

            displayProducts();

        }
    );

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const products =
        getProducts();


    const product =
        products.find(
            p => p.id === id
        );


    if(!product) return;


    document.getElementById(
        "editId"
    ).value = product.id;


    document.getElementById(
        "productName"
    ).value = product.name;


    document.getElementById(
        "productPrice"
    ).value = product.price;


    document.getElementById(
        "productCondition"
    ).value = product.condition;


    document.getElementById(
        "productStatus"
    ).value = product.status;


    document.getElementById(
        "productImage"
    ).value = product.image;


    document.getElementById(
        "productDetails"
    ).value = product.details;


    document.getElementById(
        "formTitle"
    ).innerText =
        "Edit Product";


    document.getElementById(
        "saveBtn"
    ).innerText =
        "Update Product";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this product?"
        );


    if(!confirmDelete) return;


    let products =
        getProducts();


    products =
        products.filter(
            p => p.id !== id
        );


    saveProducts(products);


    displayAdminProducts();

    displayProducts();


    alert(
        "Product removed successfully!"
    );

}


/* =====================================================
   AVAILABLE / SOLD
===================================================== */

function toggleStatus(id) {

    let products =
        getProducts();


    products =
        products.map(product => {

            if(product.id === id) {

                product.status =
                    product.status === "available"
                    ? "sold"
                    : "available";

            }

            return product;

        });


    saveProducts(products);


    displayAdminProducts();

    displayProducts();

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if(!form) return;


    form.reset();


    document.getElementById(
        "editId"
    ).value = "";


    document.getElementById(
        "formTitle"
    ).innerText =
        "Add New Product";


    document.getElementById(
        "saveBtn"
    ).innerText =
        "Add Product";

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem(
        "ownerLoggedIn"
    );


    window.location.href =
        "login.html";

}


/* =====================================================
   ADMIN DISPLAY
===================================================== */

displayAdminProducts();