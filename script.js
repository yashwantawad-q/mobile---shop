/* =====================================================
   SACHIN MOBILE
   ONLINE DATABASE - SUPABASE
   FULL SCRIPT.JS
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


const SUPABASE_URL =
    "https://bqzgwvmleguvbkicyzji.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "YOUR_PUBLISHABLE_KEY_HERE";


/* =====================================================
   CREATE SUPABASE CLIENT
===================================================== */

const supabaseClient =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =====================================================
   GET PRODUCTS
===================================================== */

async function getProducts() {

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Products loading error:",
            error
        );

        return [];

    }


    return data || [];

}


/* =====================================================
   DISPLAY PRODUCTS - HOME PAGE
===================================================== */

async function displayProducts(search = "") {

    const container =
        document.getElementById(
            "mobileProducts"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="no-products">
            <h2>Loading...</h2>
            <p>Please wait...</p>
        </div>
    `;


    const products =
        await getProducts();


    const searchText =
        search
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const details =
                String(
                    product.details || ""
                ).toLowerCase();


            return (
                name.includes(searchText) ||
                details.includes(searchText)
            );

        });


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="no-products">

                <h2>No Mobile Found</h2>

                <p>
                    No products are currently available.
                </p>

            </div>
        `;

        return;

    }


    filtered.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        const isAvailable =
            product.status === "available";


        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image || ""}"
                    alt="${product.name || "Mobile"}"
                    onerror="
                        this.src='https://via.placeholder.com/600x600?text=No+Image'
                    "
                >


                <span class="status ${
                    isAvailable
                        ? "available"
                        : "sold"
                }">

                    ${
                        isAvailable
                            ? "AVAILABLE"
                            : "SOLD"
                    }

                </span>

            </div>


            <div class="product-info">

                <h3>
                    ${product.name || "Mobile"}
                </h3>


                <p class="details">
                    ${product.details || ""}
                </p>


                <p class="condition">

                    Condition:

                    <b>
                        ${product.condition || ""}
                    </b>

                </p>


                <div class="product-bottom">

                    <strong>
                        ₹${Number(
                            product.price || 0
                        ).toLocaleString("en-IN")}
                    </strong>


                    ${
                        isAvailable

                            ?

                        `
                            <a
                                href="https://wa.me/917719042356?text=${encodeURIComponent(
                                    "I am interested in " +
                                    (product.name || "")
                                )}"
                                target="_blank"
                                class="interest-btn"
                            >
                                Enquire
                            </a>
                        `

                            :

                        `
                            <button
                                class="sold-btn"
                                disabled
                            >
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

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            displayProducts(
                this.value
            );

        }
    );

}


/* =====================================================
   CHECK OWNER ACCESS
===================================================== */

async function checkOwnerAccess() {

    const isOwnerPage =
        window.location.pathname
            .toLowerCase()
            .includes("owner.html");


    if (!isOwnerPage) {

        return true;

    }


    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !data ||
        !data.user
    ) {

        window.location.href =
            "login.html";

        return false;

    }


    const user =
        data.user;


    const {
        data: owner,
        error: ownerError
    } =
        await supabaseClient
            .from("owner_profiles")
            .select("user_id")
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (ownerError) {

        console.error(
            "Owner check error:",
            ownerError
        );


        alert(
            "Owner verification error:\n\n" +
            ownerError.message
        );


        return false;

    }


    if (!owner) {

        alert(
            "You are not authorized as owner."
        );


        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "login.html";


        return false;

    }


    return true;

}


/* =====================================================
   DISPLAY ADMIN PRODUCTS
===================================================== */

async function displayAdminProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="empty-admin">
            Loading products...
        </div>
    `;


    const products =
        await getProducts();


    container.innerHTML = "";


    if (products.length === 0) {

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


        const isAvailable =
            product.status === "available";


        item.innerHTML = `

            <img
                src="${product.image || ""}"
                alt="${product.name || "Mobile"}"
                onerror="
                    this.src='https://via.placeholder.com/150?text=No+Image'
                "
            >


            <div class="admin-product-info">

                <h3>
                    ${product.name || "Mobile"}
                </h3>


                <p>
                    ₹${Number(
                        product.price || 0
                    ).toLocaleString("en-IN")}
                </p>


                <span>
                    ${product.condition || ""}
                </span>


                <b class="${
                    isAvailable
                        ? "available"
                        : "sold"
                }">

                    ${
                        isAvailable
                            ? "AVAILABLE"
                            : "SOLD"
                    }

                </b>

            </div>


            <div class="admin-actions">

                <button
                    type="button"
                    class="edit-btn"
                    onclick="editProduct('${product.id}')"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteProduct('${product.id}')"
                >
                    Delete
                </button>


                <button
                    type="button"
                    class="status-btn"
                    onclick="toggleStatus('${product.id}')"
                >

                    ${
                        isAvailable
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
   SETUP PRODUCT FORM
===================================================== */

function setupProductForm() {

    const productForm =
        document.getElementById(
            "productForm"
        );


    if (!productForm) {
        return;
    }


    productForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const {
                data: userData
            } =
                await supabaseClient.auth.getUser();


            if (
                !userData ||
                !userData.user
            ) {

                alert(
                    "Please login as owner first."
                );

                window.location.href =
                    "login.html";

                return;

            }


            const editId =
                document.getElementById(
                    "editId"
                ).value.trim();


            const name =
                document.getElementById(
                    "productName"
                ).value.trim();


            const price =
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                );


            const condition =
                document.getElementById(
                    "productCondition"
                ).value;


            const status =
                document.getElementById(
                    "productStatus"
                ).value;


            const image =
                document.getElementById(
                    "productImage"
                ).value.trim();


            const details =
                document.getElementById(
                    "productDetails"
                ).value.trim();


            /* ==============================
               VALIDATION
            ============================== */

            if (!name) {

                alert(
                    "Mobile name enter करा."
                );

                return;

            }


            if (
                isNaN(price) ||
                price < 0
            ) {

                alert(
                    "Valid price enter करा."
                );

                return;

            }


            if (!condition) {

                alert(
                    "Condition select करा."
                );

                return;

            }


            if (!details) {

                alert(
                    "Details enter करा."
                );

                return;

            }


            /* ==============================
               PRODUCT OBJECT
            ============================== */

            const product = {

                name: name,

                price: price,

                condition: condition,

                status:
                    status ||
                    "available",

                image:
                    image ||
                    "https://via.placeholder.com/600x600?text=Mobile",

                details: details

            };


            const saveBtn =
                document.getElementById(
                    "saveBtn"
                );


            if (saveBtn) {

                saveBtn.disabled =
                    true;


                saveBtn.innerText =
                    editId
                        ? "Updating..."
                        : "Adding...";

            }


            /* ==============================
               UPDATE PRODUCT
            ============================== */

            if (editId) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .update(product)
                        .eq(
                            "id",
                            editId
                        );


                if (error) {

                    console.error(
                        "Update error:",
                        error
                    );


                    alert(
                        "Product update failed:\n\n" +
                        error.message
                    );


                    if (saveBtn) {

                        saveBtn.disabled =
                            false;

                        saveBtn.innerText =
                            "Update Product";

                    }


                    return;

                }


                alert(
                    "Product updated successfully!"
                );

            }


            /* ==============================
               ADD PRODUCT
            ============================== */

            else {

                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .insert([
                            product
                        ]);


                if (error) {

                    console.error(
                        "Insert error:",
                        error
                    );


                    alert(
                        "Product add failed:\n\n" +
                        error.message
                    );


                    if (saveBtn) {

                        saveBtn.disabled =
                            false;

                        saveBtn.innerText =
                            "Add Product";

                    }


                    return;

                }


                alert(
                    "Product added successfully!"
                );

            }


            /* ==============================
               REFRESH
            ============================== */

            resetForm();


            await displayAdminProducts();

            await displayProducts();


            if (saveBtn) {

                saveBtn.disabled =
                    false;

            }

        }
    );

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

async function editProduct(id) {

    const products =
        await getProducts();


    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    const editId =
        document.getElementById(
            "editId"
        );


    const productName =
        document.getElementById(
            "productName"
        );


    const productPrice =
        document.getElementById(
            "productPrice"
        );


    const productCondition =
        document.getElementById(
            "productCondition"
        );


    const productStatus =
        document.getElementById(
            "productStatus"
        );


    const productImage =
        document.getElementById(
            "productImage"
        );


    const productDetails =
        document.getElementById(
            "productDetails"
        );


    if (editId) {

        editId.value =
            product.id;

    }


    if (productName) {

        productName.value =
            product.name || "";

    }


    if (productPrice) {

        productPrice.value =
            product.price || "";

    }


    if (productCondition) {

        productCondition.value =
            product.condition || "";

    }


    if (productStatus) {

        productStatus.value =
            product.status ||
            "available";

    }


    if (productImage) {

        productImage.value =
            product.image || "";

    }


    if (productDetails) {

        productDetails.value =
            product.details || "";

    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.innerText =
            "Edit Product";

    }


    const saveBtn =
        document.getElementById(
            "saveBtn"
        );


    if (saveBtn) {

        saveBtn.innerText =
            "Update Product";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

    const confirmed =
        window.confirm(
            "Are you sure you want to remove this product?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Delete failed:\n\n" +
            error.message
        );


        return;

    }


    await displayAdminProducts();

    await displayProducts();


    alert(
        "Product removed successfully!"
    );

}


/* =====================================================
   TOGGLE AVAILABLE / SOLD
===================================================== */

async function toggleStatus(id) {

    const products =
        await getProducts();


    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    const newStatus =
        product.status === "available"
            ? "sold"
            : "available";


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({

                status: newStatus

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Status error:",
            error
        );


        alert(
            "Status update failed:\n\n" +
            error.message
        );


        return;

    }


    await displayAdminProducts();

    await displayProducts();

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    const editId =
        document.getElementById(
            "editId"
        );


    if (editId) {

        editId.value = "";

    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.innerText =
            "Add New Product";

    }


    const saveBtn =
        document.getElementById(
            "saveBtn"
        );


    if (saveBtn) {

        saveBtn.innerText =
            "Add Product";


        saveBtn.disabled =
            false;

    }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Logout failed:\n\n" +
            error.message
        );


        return;

    }


    window.location.href =
        "login.html";

}


/* =====================================================
   MAKE FUNCTIONS AVAILABLE
   FOR HTML onclick
===================================================== */

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.toggleStatus =
    toggleStatus;

window.logout =
    logout;

window.resetForm =
    resetForm;


/* =====================================================
   INITIALIZE PAGE
===================================================== */

async function initializePage() {

    setupSearch();

    setupProductForm();


    const ownerAccess =
        await checkOwnerAccess();


    if (
        window.location.pathname
            .toLowerCase()
            .includes("owner.html")
        &&
        !ownerAccess
    ) {

        return;

    }


    await displayProducts();

    await displayAdminProducts();

}


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePage
    );

} else {

    initializePage();

}
