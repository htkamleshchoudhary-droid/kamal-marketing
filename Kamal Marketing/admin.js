// Default products if none exist yet in LocalStorage
const defaultProducts = [
  {
    id: 1,
    title: "Flex Banner Rolls",
    image: "assets/flex-banner.jpg",
    description: "Frontlit, Backlit, and Blockout flex rolls of premium quality."
  },
  {
    id: 2,
    title: "Vinyl & Radium Rolls",
    image: "assets/vinyl.jpg",
    description: "Cast, calendered, and specialty vinyl for all signage applications."
  },
  {
    id: 3,
    title: "PVC Sheets & ACP",
    image: "assets/pvc-acp.jpg",
    description: "Durable ACP panels and PVC foam boards for boards and displays."
  }
];

// Load products on admin page load
document.addEventListener("DOMContentLoaded", () => {
  loadAdminProducts();
});

function getStoredProducts() {
  const data = localStorage.getItem("kamal_products");
  return data ? JSON.parse(data) : defaultProducts;
}

function saveStoredProducts(products) {
  localStorage.setItem("kamal_products", JSON.stringify(products));
}

// Render products inside Admin panel for editing/deleting
function loadAdminProducts() {
  const products = getStoredProducts();
  const listContainer = document.getElementById("admin-products-list");
  listContainer.innerHTML = "<h3>Manage Existing Products</h3>";

  products.forEach((prod, index) => {
    listContainer.innerHTML += `
      <div class="admin-card">
        <h3>Product ${index + 1}: ${prod.title}</h3>
        <div style="margin-bottom: 15px;">
          <img src="${prod.image}" alt="${prod.title}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 6px;">
        </div>
        <form onsubmit="updateProduct(event, ${prod.id})">
          <div class="form-group">
            <label>Product Title</label>
            <input type="text" id="title-${prod.id}" value="${prod.title}" required>
          </div>
          <div class="form-group">
            <label>Change Image (Optional - choose new file)</label>
            <input type="file" id="img-${prod.id}" accept="image/*">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="desc-${prod.id}" rows="3" required>${prod.description}</textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <button type="button" class="btn" style="background-color: #d9534f; color: white; margin-left: 10px;" onclick="deleteProduct(${prod.id})">Delete Product</button>
        </form>
      </div>
    `;
  });
}

// Add New Product with Image Reader
function addNewProduct(event) {
  event.preventDefault();
  const title = document.getElementById("new-title").value;
  const desc = document.getElementById("new-desc").value;
  const imageFile = document.getElementById("new-image").files[0];

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageUrl = e.target.result; // Base64 image string
    const products = getStoredProducts();
    
    const newProduct = {
      id: Date.now(), // unique ID
      title: title,
      image: imageUrl,
      description: desc
    };

    products.push(newProduct);
    saveStoredProducts(products);
    alert("New product added successfully!");
    document.getElementById("add-product-form").reset();
    loadAdminProducts();
  };

  if (imageFile) {
    reader.readAsDataURL(imageFile);
  }
}

// Update Existing Product
function updateProduct(event, id) {
  event.preventDefault();
  const products = getStoredProducts();
  const prodIndex = products.findIndex(p => p.id === id);

  const title = document.getElementById(`title-${id}`).value;
  const desc = document.getElementById(`desc-${id}`).value;
  const imageInput = document.getElementById(`img-${id}`);

  products[prodIndex].title = title;
  products[prodIndex].description = desc;

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      products[prodIndex].image = e.target.result;
      saveStoredProducts(products);
      alert("Product updated successfully with new image!");
      loadAdminProducts();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    saveStoredProducts(products);
    alert("Product updated successfully!");
    loadAdminProducts();
  }
}

// Delete Product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    let products = getStoredProducts();
    products = products.filter(p => p.id !== id);
    saveStoredProducts(products);
    loadAdminProducts();
  }
}