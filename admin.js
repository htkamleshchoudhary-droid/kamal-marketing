// Default products fallback
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
  initLocalStorage();
  loadAdminProducts();
});

// Initialize LocalStorage if empty
function initLocalStorage() {
  if (!localStorage.getItem("kamal_products")) {
    localStorage.setItem("kamal_products", JSON.stringify(defaultProducts));
  }
}

function getStoredProducts() {
  const data = localStorage.getItem("kamal_products");
  return data ? JSON.parse(data) : defaultProducts;
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem("kamal_products", JSON.stringify(products));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      alert("Storage limit reached! Please choose a smaller image file or delete older products.");
    } else {
      console.error(e);
    }
  }
}

// Helper function to compress images before converting to Base64
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 600; // max width for web performance and storage saving
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with 0.7 quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(dataUrl);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Render products inside Admin panel for editing/deleting
function loadAdminProducts() {
  const products = getStoredProducts();
  const listContainer = document.getElementById("admin-products-list");
  if (!listContainer) return;

  listContainer.innerHTML = "<h3 style='margin-bottom: 20px; color: var(--primary-color);'>Manage Existing Products</h3>";

  products.forEach((prod, index) => {
    listContainer.innerHTML += `
      <div class="admin-card">
        <h3>Product ${index + 1}: ${prod.title}</h3>
        <div style="margin-bottom: 15px;">
          <img src="${prod.image}" alt="${prod.title}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ccc;">
        </div>
        <form onsubmit="updateProduct(event, ${prod.id})">
          <div class="form-group">
            <label>Product Title</label>
            <input type="text" id="title-${prod.id}" value="${prod.title}" required>
          </div>
          <div class="form-group">
            <label>Change Image (Choose new file from device)</label>
            <input type="file" id="img-${prod.id}" accept="image/*">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="desc-${prod.id}" rows="3" required>${prod.description}</textarea>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <button type="button" class="btn" style="background-color: #d4140d; color: white;" onclick="deleteProduct(${prod.id})">Delete Product</button>
          </div>
        </form>
      </div>
    `;
  });
}

// Add New Product with Image Compression
function addNewProduct(event) {
  event.preventDefault();
  const title = document.getElementById("new-title").value;
  const desc = document.getElementById("new-desc").value;
  const imageInput = document.getElementById("new-image");

  if (!imageInput.files || !imageInput.files[0]) {
    alert("Please select an image file.");
    return;
  }

  compressImage(imageInput.files[0], function(compressedImageUrl) {
    const products = getStoredProducts();
    const newProduct = {
      id: Date.now(),
      title: title,
      image: compressedImageUrl,
      description: desc
    };

    products.push(newProduct);
    saveStoredProducts(products);
    alert("New product added successfully!");
    document.getElementById("add-product-form").reset();
    loadAdminProducts();
  });
}

// Update Existing Product with Image Compression
function updateProduct(event, id) {
  event.preventDefault();
  const products = getStoredProducts();
  const prodIndex = products.findIndex(p => p.id === id);

  if (prodIndex === -1) {
    alert("Product not found!");
    return;
  }

  const title = document.getElementById(`title-${id}`).value;
  const desc = document.getElementById(`desc-${id}`).value;
  const imageInput = document.getElementById(`img-${id}`);

  products[prodIndex].title = title;
  products[prodIndex].description = desc;

  if (imageInput.files && imageInput.files[0]) {
    compressImage(imageInput.files[0], function(compressedImageUrl) {
      products[prodIndex].image = compressedImageUrl;
      saveStoredProducts(products);
      alert("Product updated successfully with new image!");
      loadAdminProducts();
    });
  } else {
    saveStoredProducts(products);
    alert("Product details updated successfully!");
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