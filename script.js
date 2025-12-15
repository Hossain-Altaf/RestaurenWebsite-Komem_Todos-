// Menu Items Data
const menuItems = [
    { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 12.99, image: '🍕', description: 'Classic tomato, mozzarella, and basil' },
    { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', price: 14.99, image: '🍕', description: 'Loaded with pepperoni and cheese' },
    { id: 3, name: 'Caesar Salad', category: 'Salads', price: 8.99, image: '🥗', description: 'Crispy romaine with Caesar dressing' },
    { id: 4, name: 'Chicken Burger', category: 'Burgers', price: 11.99, image: '🍔', description: 'Grilled chicken with fresh veggies' },
    { id: 5, name: 'Beef Burger', category: 'Burgers', price: 13.99, image: '🍔', description: 'Juicy beef patty with special sauce' },
    { id: 6, name: 'Pasta Carbonara', category: 'Pasta', price: 13.99, image: '🍝', description: 'Creamy pasta with bacon' },
    { id: 7, name: 'Chocolate Cake', category: 'Desserts', price: 6.99, image: '🍰', description: 'Rich chocolate layer cake' },
    { id: 8, name: 'Tiramisu', category: 'Desserts', price: 7.99, image: '🍰', description: 'Classic Italian dessert' }
];

// State Management
let cart = [];
let orders = [];
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateUI();
    renderMenu();
});

// Local Storage Functions
function loadFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    const storedOrders = localStorage.getItem('orders');
    const storedUser = localStorage.getItem('currentUser');

    if (storedCart) cart = JSON.parse(storedCart);
    if (storedOrders) orders = JSON.parse(storedOrders);
    if (storedUser) currentUser = JSON.parse(storedUser);
}

function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');

    // Show selected page
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }

    // Update page-specific content
    if (pageName === 'cart') renderCart();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'menu') renderMenu();

    // Close mobile menu
    const nav = document.getElementById('nav');
    if (nav) nav.classList.remove('active');
}

function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

// Update UI
function updateUI() {
    const cartBadge = document.getElementById('cart-badge');
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    // Update cart badge
    cartBadge.textContent = cart.length;

    // Update user section
    if (currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = `Hi, ${currentUser.name}`;
    } else {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Render Menu
function renderMenu() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';

    // Group items by category
    const categories = [...new Set(menuItems.map(item => item.category))];

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);

        const menuGrid = document.createElement('div');
        menuGrid.className = 'menu-grid';

        const categoryItems = menuItems.filter(item => item.category === category);
        categoryItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'menu-item';
            itemCard.innerHTML = `
                <div class="menu-item-image">${item.image}</div>
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                    <button class="btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            `;
            menuGrid.appendChild(itemCard);
        });

        categoryDiv.appendChild(menuGrid);
        menuContainer.appendChild(categoryDiv);
    });
}

// Cart Functions
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveToLocalStorage();
    updateUI();
    showNotification('Item added to cart!');
}

function updateQuantity(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveToLocalStorage();
            renderCart();
            updateUI();
        }
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveToLocalStorage();
    renderCart();
    updateUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 1.5rem;">Your cart is empty</p>
                <button class="btn-primary" onclick="showPage('menu')">Browse Menu</button>
            </div>
        `;
        return;
    }

    cartContainer.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">${item.image}</div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="cart-qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="btn-danger" onclick="removeFromCart(${item.id})">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            <div class="cart-total-row">
                <span>Total:</span>
                <span class="cart-total-amount">$${getCartTotal()}</span>
            </div>
            <button class="btn-primary" style="width: 100%;" onclick="placeOrder()">Place Order</button>
        </div>
    `;
}

// Order Functions
function placeOrder() {
    if (!currentUser) {
        alert('Please login to place an order');
        showPage('login');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const newOrder = {
        id: Date.now(),
        items: [...cart],
        total: getCartTotal(),
        status: 'Pending',
        date: new Date().toLocaleString(),
        userId: currentUser.email
    };

    orders.push(newOrder);
    cart = [];
    saveToLocalStorage();
    updateUI();
    alert('Order placed successfully!');
    showPage('orders');
}

function renderOrders() {
    const ordersContainer = document.getElementById('orders-container');

    if (!currentUser) {
        ordersContainer.innerHTML = `
            <div class="orders-empty">
                <p style="font-size: 1.25rem; margin-bottom: 1.5rem;">Please login to view orders</p>
                <button class="btn-primary" onclick="showPage('login')">Login</button>
            </div>
        `;
        return;
    }

    const userOrders = orders.filter(order => order.userId === currentUser.email);

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="orders-empty">
                <p style="font-size: 1.25rem;">No orders yet</p>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = userOrders.reverse().map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <p>Order #${order.id}</p>
                    <p>${order.date}</p>
                </div>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Total:</span>
                <span class="order-total-amount">$${order.total}</span>
            </div>
        </div>
    `).join('');
}

// Auth Functions
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    currentUser = {
        email: email,
        name: email.split('@')[0]
    };

    saveToLocalStorage();
    updateUI();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showPage('menu');
}

function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    currentUser = {
        email: email,
        name: name
    };

    saveToLocalStorage();
    updateUI();
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    showPage('menu');
}

function logout() {
    currentUser = null;
    saveToLocalStorage();
    updateUI();
    showPage('home');
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);