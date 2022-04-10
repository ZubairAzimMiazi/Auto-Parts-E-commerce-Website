// Pre Loader
window.onload = function () {
  document.getElementById('loader').style.display = 'none';
}

// get the category and sub category id from the url
let getUrlParamsProductId = function (url) {
  let params = {};
  (url + "?")
    .split("?")[1]
    .split("&")
    .forEach(function (pair) {
      pair = (pair + "=").split("=").map(decodeURIComponent);
      if (pair[0].length) {
        params[pair[0]] = pair[1];
      }
    });

  return params;
};

// asynchronous function to fetch products from JSON
async function getProductDetails() {
  let products = true;

  // get the ids
  let params = getUrlParamsProductId(window.location.href);
  let pid = params.p_id; // product id url

  // fetch the data from local json file
  const response = await fetch("../assets/JSON/decent-parts.json");

  //convert the response to JSON format
  const categories = await response.json();

  categories.forEach((category) => {
    // get sub categories array from each category
    let sub_categories = category.autoSubPart;
    sub_categories.forEach((sub_cat) => {
      // get product array from each sub category
      let product_categories = sub_cat.products;
      let similar_products = []; //similar products array

      product_categories.forEach((product_detail) => {
        if (product_detail.p_id == pid) {
          products = sub_cat.products;
          // Display the product information and product specs in the UI
          document.querySelector(".products-container").innerHTML = products
            .map((product) => {
              if (product.p_id == pid) {
                if (product.stock_amount == 0) {
                  product.stock_amount = "Out Of Stock";
                } else {
                  product.stock_amount = "In Stock";
                }

                return `
              <div class = "container">
              <div class="row">
              <div class="col-md-6">
                <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src=${product.url1} class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item">
                            <img src=${product.url2} class="d-block w-100"
                                alt="...">
                        </div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
            </div>

            <div class="col-md-6 product-det">
                <p><p><b> <a href="../index.html">Home</a> / <a href="../index.html#${category.id}"> ${category.autoPart}</a> / <a href="product.html?id=${category.id}&c_id=${sub_cat.c_id}"> ${sub_cat.name} </a> / ${product_detail.name} </b></p>
                <hr></p>
                <h1>${product.name}</h1>
                <h4 class="product-price">Tk: ${product.price}</h4>
                <p><b>Availability:</b> <span class="badge badge-pill badge-primary">${product.stock_amount}</span></p>

                <div>
                    <label style="color:white">Quantity:</label>
                    <button class="sub-product">-</button>
                    <input type="text" name="quantity" value="1" class="cart-edit product-quantity" disabled>
                    <button class="add-product">+</button>
                    <button type="button" class="btn btn-default cart add-to-cart">Add to Cart</button>
                </div>
                <hr>
            </div>
            </div>
        </div>
        <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <h3 class="title"> Product Specs</h3>
                <hr>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <p>${product.description}.</p>
            </div>
        </div>
    </div> `;
              }
              else {
                similar_products.push(product);

                // Display the first 3 similar products in the product details page
                document.querySelector(".similar-products").innerHTML = similar_products.map((similarProduct, index) => {
                  if (index < 3) {
                    return `<div class="col-md-4 text-center">
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><img src="${similarProduct.url1}" height="300" ></a>
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><h6 class="mt-2 similar-product-heading">${similarProduct.name}</h6></a>
                              <span class="badge badge-pill badge-danger text-white py-2 px-3">${similarProduct.price} TK.</span>
                          </div>`;
                  }
                }).join("");
              }
            })
            .join("");

          function addToCart() {
            let quantity = 1;
            let totalPrice = product_detail.price;
            let subtractProduct = document.querySelector(".sub-product");
            let addProduct = document.querySelector(".add-product");
            let productQuantity = document.querySelector(".product-quantity");
            let addToCart = document.querySelector(".add-to-cart");

            // add to the totalprice and quantity
            addProduct.onclick = function () {
              totalPrice += product_detail.price;
              quantity++;
              productQuantity.value = quantity;
            };

            // subtract from the totalprice and quantity
            subtractProduct.onclick = function () {
              if (quantity > 1) {
                totalPrice -= product_detail.price;
                quantity--;
                productQuantity.value = quantity;
              }
            };
            // Save the total price and quantiy of all the products
            addToCart.onclick = function () {

              let cartItems = []; // array of selected products by user

              // getting all selected product details
              let productJson = {
                product_id: product_detail.p_id,
                category_name: category.autoPart,
                product_name: product_detail.name,
                product_description: product_detail.description,
                product_image: product_detail.url1,
                product_quantity: parseInt(productQuantity.value),
                product_price: product_detail.price,
                total_price: totalPrice
              };

              /*
                check if, products are already added in the cart.
                If so, then keep them in the cart, and add new products.
              */
              if (localStorage.getItem("products") !== null) {

                let previousProducts = JSON.parse(localStorage.getItem("products"));
                previousProducts.forEach(preProduct => {

                  /*
                    if selected product is aleady added, 
                    it should be overriden with the new one.
                  */
                  if (preProduct.product_id !== productJson.product_id) {
                    cartItems.push(preProduct);
                  }
                });
              }

              // adding new products
              cartItems.push(productJson);

              // storing purchased product detail in local storage with totalprice and quantity
              localStorage.setItem("products", JSON.stringify(cartItems));

              // update the value of quantity on cart icon
              showQuantity();
            };
          }

          // function call to add products to localStorage
          addToCart();

        }

      });
    });
  });

}

// Function to display the product quantity on the cart icon
function showQuantity() {
  let userCart = document.getElementById("user-cart");

  let totalQuantity = 0; //set initial quantity to 0

  // get all products ftom localStorage
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
getProductDetails();

// Show the product quantity on cart icon
showQuantity();