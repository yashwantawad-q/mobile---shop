/* =====================================================
   SACHIN MOBILE WEBSITE
   ONLINE DATABASE PRODUCT MANAGEMENT
   Uses Supabase
===================================================== */


/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://bqzgwvmleguvbkicyzji.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_AcUWdnxtWLVB1mAKD5cUlg_Q6mRfvlg";


/* =====================================================
   SUPABASE CLIENT
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =====================================================
   GET PRODUCTS FROM ONLINE DATABASE
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


    if(error) {

        console.error(
            "Error loading products:",
            error
        );

        return [];

    }


    return data || [];

}


/* =====================================================
   DISPLAY PRODUCTS ON HOME PAGE
===================================================== */

async function displayProducts(search = "") {

    const container =
        document.getElementById(
            "mobileProducts"
        );


    if(!container) return;


    container.innerHTML = `
        <div class="no-products">
            <h2>Loading...</h2>
            <p>Please wait...</p>
        </div>
    `;


    const products =
        await getProducts();


    const filtered =
        products.filter(product => {

            return (
                product.name || ""
            )
            .toLowerCase()
            .includes(
                search.toLowerCase()
            );

        });


    container.innerHTML = "";


    if(filtered.length === 0) {

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
                    src="${product.image || ""}"
                    alt="${product.name || "Mobile"}"
                    onerror="this.src='https://via.placeholder.com/600x600?text=No+Image'"
                >

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </div>


            <div class="product-info">

                <h3>
                    ${product.name || ""}
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
                        product.status === "available"

                        ?

                        `

                        <a
                            href="https://wa.me/917719042356?text=I%20am%20interested%20in%20${encodeURIComponent(product.name || "")}"
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
    document.getElementById(
        "searchInput"
    );


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
   OWNER LOGIN CHECK
===================================================== */

async function checkOwnerAccess() {

    if(
        !window.location.pathname.includes(
            "owner.html"
        )
    ) {

        return true;

    }


    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if(!user) {

        window.location.href =
            "login.html";

        return false;

    }


    const {
        data: owner,
        error
    } =
        await supabaseClient
            .from("owner_profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();


    if(error || !owner) {

        alert(
            "You are not authorized as owner."
        );


        await supabaseClient.auth.signOut();


        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


/* =====================================================
   OWNER PRODUCT LIST
===================================================== */

async function displayAdminProducts() {

    const container =
        document.getElementById(
            "adminProducts"
        );


    if(!container) return;


    container.innerHTML = `

        <div class="empty-admin">

            Loading products...

        </div>

    `;


    const products =
        await getProducts();


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
                src="${product.image || ""}"
                onerror="this.src='https://via.placeholder.com/150?text=No+Image'"
            >


            <div class="admin-product-info">

                <h3>
                    ${product.name || ""}
                </h3>


                <p>
                    ₹${Number(
                        product.price || 0
                    ).toLocaleString("en-IN")}
                </p>


                <span>
                    ${product.condition || ""}
                </span>


                <b class="${product.status}">
                    ${product.status || ""}
                </b>

            </div>


            <div class="admin-actions">

                <button
                    onclick="editProduct('${product.id}')"
                    class="edit-btn">

                    Edit

                </button>


                <button
                    onclick="deleteProduct('${product.id}')"
                    class="delete-btn">

                    Delete

                </button>


                <button
                    onclick="toggleStatus('${product.id}')"
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
        async function(e) {

            e.preventDefault();


            const editId =
                document.getElementById(
                    "editId"
                ).value;


            const product = {

                name:
                    document.getElementById(
                        "productName"
                    ).value.trim(),


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
                    ).value.trim()
                    ||
                    "https://via.placeholder.com/600x600?text=Mobile",


                details:
                    document.getElementById(
                        "productDetails"
                    ).value.trim()

            };


            /* =================================================
               EDIT EXISTING PRODUCT
            ================================================= */

            if(editId) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .update(product)
                        .eq("id", editId);


                if(error) {

                    console.error(error);

                    alert(
                        "Error updating product: " +
                        error.message
                    );

                    return;

                }


                alert(
                    "Product updated successfully!"
                );

            }


            /* =================================================
               ADD NEW PRODUCT
            ================================================= */

            else {

                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .insert([product]);


                if(error) {

                    console.error(error);

                    alert(
                        "Error adding product: " +
                        error.message
                    );

                    return;

                }


                alert(
                    "Product added successfully!"
                );

            }


            resetForm();


            await displayAdminProducts();

            await displayProducts();

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
            p => String(p.id) === String(id)
        );


    if(!product) {

        alert(
            "Product not found."
        );

        return;

    }


    document.getElementById(
        "editId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";


    document.getElementById(
        "productCondition"
    ).value =
        product.condition || "";


    document.getElementById(
        "productStatus"
    ).value =
        product.status || "available";


    document.getElementById(
        "productImage"
    ).value =
        product.image || "";


    document.getElementById(
        "productDetails"
    ).value =
        product.details || "";


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

async function deleteProduct(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this product?"
        );


    if(!confirmDelete) return;


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);


    if(error) {

        console.error(error);

        alert(
            "Error deleting product: " +
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
   AVAILABLE / SOLD
===================================================== */

async function toggleStatus(id) {

    const products =
        await getProducts();


    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if(!product) return;


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
            .eq("id", id);


    if(error) {

        console.error(error);

        alert(
            "Error changing status: " +
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

async function logout() {

    await supabaseClient.auth.signOut();


    window.location.href =
        "login.html";

}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

async function initializePage() {

    const ownerAccess =
        await checkOwnerAccess();


    if(
        window.location.pathname.includes(
            "owner.html"
        )
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

initializePage();
