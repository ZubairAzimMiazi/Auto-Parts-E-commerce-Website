// Pre Loader
window.onload = function () {
    document.getElementById('loader').style.display = 'none';
}

// get the category and sub category id from url
let getUrlParams = function (url) {
    let params = {};
    (url + '?').split('?')[1].split('&').forEach(
        function (pair) {
            pair = (pair + '=').split('=').map(decodeURIComponent);
            if (pair[0].length) {
                params[pair[0]] = pair[1];
            }
        });

    return params;
};

// asynchronous function to fetch products from JSON
async function getProducts() {

    let products;
    let hasNavigationBar = false;
    // get the ids
    let params = getUrlParams(window.location.href);
    let id = params.id; // main category id 
    let cid = params.c_id // sub-category id
    // fetch the data from local json file
    const response = await fetch("../assets/JSON/decent-parts.json");
    //convert the response to JSON format
    const categories = await response.json();

    categories.forEach(category => {

        // get sub categories array from each category
        let sub_categories = category.autoSubPart;

        sub_categories.forEach(sub_cat => {
            if (category.id == id && sub_cat.c_id == cid) {
                products = sub_cat.products;
                document.querySelector(".product-navigation").innerHTML = products.map(product => {
                    if (!hasNavigationBar) {
                        hasNavigationBar = true;
                        return `
                              <p><b> <a href="../index.html">Home</a> / <a href="../index.html#${category.id}"> ${category.autoPart} </a> / ${sub_cat.name} </b></p>
                              <hr>`;
                    }
                }).join('');

                // Display the product information in the UI 
                document.querySelector(".products-container").innerHTML = products.map(product => {
                    return `
                        <div class="col-md-4">
                            <div class="product-top">
                               <a href="product_detail.html?p_id=${product.p_id}"><img src=${product.url1}></a>
                               <div class="overlay">
                                   <a href="product_detail.html?p_id=${product.p_id}" class="btn btn-secondary" title="Quick View"><i class="far fa-eye"></i></a>
                                </div>    
                            </div>
                            <div class="product-bottom text-center">
                                 <h4 class="product-name">${product.name}</h4>
                                 <p class="sec-product-price">${product.price} TK.</p>
                            </div>
                        </div>`;
                }).join('');

            }
            else {
                console.log("Category or Sub Category Id's doesn't Match!");
            }
        });

    });
}

// Function to display the product quantity on the cart icon
function showQuantity() {

    let userCart = document.getElementById("user-cart");
    let totalQuantity = 0; //set initial quantity to 0

    // get all products from localStorage
    let cartCurrentProducts = JSON.parse(localStorage.getItem("products"));

    if (cartCurrentProducts !== null) {
        // Increment the product quantity
        cartCurrentProducts.forEach(cartCurrentProduct => {
            totalQuantity += cartCurrentProduct.product_quantity;
        });
    }
    userCart.onclick = function () {
        if (totalQuantity === 0) {
            swal("Your cart is currently empty!", "Please, select the item to see cart page.", "info");
        }
        else {
            userCart.href = "user-cart.html";
        }
    };

    // Display the total product quantity on the cart icon
    document.querySelector(".total-quantity").innerHTML = `<span>${totalQuantity}</span>`;

}

//function call to get products
getProducts();

// Show the product quantity on cart icon
showQuantity();