// Constants for API and DOM elements
const API_URL = 'https://675fc6d91f7ad2426999495f.mockapi.io/api/v1/productos';
const CURRENCY_PREFIX = 'US$';

// DOM Elements
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const addProductForm = document.getElementById('add-product-form');
const priceInput = document.getElementById('precio');
const productGrid = document.querySelector('.grid-productos');

/**
 * Displays a modal with an enlarged product image and details
 * @param {string} imageSrc - URL of the product image
 * @param {string} title - Product title
 * @param {string} price - Product price
 */
const openModal = (imageSrc, title, price) => {
    if (!imageSrc || !title) {
        console.error('Missing required parameters for modal');
        return;
    }
    
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modal.classList.add('show');
};

/**
 * Closes the modal window
 */
const closeModal = () => modal.classList.remove('show');

/**
 * Formats price input with currency prefix and validation
 * @param {string} value - Raw price input value
 * @returns {string} Formatted price string
 */
const formatPrice = (value) => {
    const numericValue = value.replace(/[^0-9.,]/g, '');
    const parts = numericValue.split(/[,|.]/);
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;
    
    return formattedValue ? `${CURRENCY_PREFIX}${formattedValue}` : '';
};

/**
 * Makes an API request with error handling
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data or error
 */
const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

/**
 * Creates and returns a product element
 * @param {Object} product - Product data
 * @returns {HTMLElement} Product DOM element
 */
const createProductElement = (product) => {
    const template = document.querySelector('.producto-nuevo');
    const productElement = template.cloneNode(true);
    
    productElement.classList.remove('producto-nuevo');
    productElement.removeAttribute('hidden');
    productElement.classList.add('producto');

    // Set product details
    const img = productElement.querySelector('img');
    img.src = product.imagen;
    img.alt = product.nombre;
    productElement.querySelector('h3').textContent = product.nombre;
    productElement.querySelector('p').textContent = product.precio;

    // Add event listeners
    img.addEventListener('click', () => openModal(product.imagen, product.nombre, product.precio));
    
    const deleteButton = productElement.querySelector('.eliminar');
    deleteButton.addEventListener('click', async () => {
        try {
            await apiRequest(`${API_URL}/${product.id}`, { method: 'DELETE' });
            productElement.remove();
        } catch (error) {
            alert('Failed to delete product. Please try again.');
        }
    });

    return productElement;
};

/**
 * Renders a product in the product grid
 * @param {Object} product - Product data to render
 */
const renderProduct = (product) => {
    const productElement = createProductElement(product);
    productGrid.appendChild(productElement);
};

/**
 * Loads all products from the API
 */
const loadProducts = async () => {
    try {
        const products = await apiRequest(API_URL);
        products.forEach(renderProduct);
    } catch (error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Failed to load products. Please refresh the page.';
        productGrid.appendChild(errorMessage);
    }
};

// Event Listeners
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = Object.fromEntries(formData.entries());

    try {
        const savedProduct = await apiRequest(API_URL, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        
        renderProduct(savedProduct);
        event.target.reset();
    } catch (error) {
        alert('Failed to add product. Please try again.');
    }
});

priceInput.addEventListener('input', (e) => {
    e.target.value = formatPrice(e.target.value);
});

priceInput.addEventListener('focus', (e) => {
    if (!e.target.value.startsWith(CURRENCY_PREFIX)) {
        e.target.value = CURRENCY_PREFIX + e.target.value;
    }
});

// Initialize
loadProducts();