document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    let cart = {};
    let selectedCategory = 'all';

    const productsContainer = document.getElementById('products-container');

    // 1. Liste des catégories dynamiques
    const categories = [
        { id: 'all', name: 'Tous', icon: 'grid' },
        { id: 'pastels', name: 'Pastels', icon: 'disc' },
        { id: 'box', name: 'Box', icon: 'package' },
        { id: 'desserts', name: 'Desserts', icon: 'heart' },
        { id: 'boissons', name: 'Boissons', icon: 'coffee' }
    ];

    // 2. Rendu des boutons de filtres minimalistes
    function renderCategoryFilters() {
        let filterWrapper = document.getElementById('category-filters');
        
        // Crée l'élément conteneur si inexistant dans le DOM
        if (!filterWrapper) {
            filterWrapper = document.createElement('div');
            filterWrapper.id = 'category-filters';
            filterWrapper.className = 'category-filters';
            productsContainer.parentNode.insertBefore(filterWrapper, productsContainer);
        }

        filterWrapper.innerHTML = categories.map(cat => `
            <button class="filter-btn ${selectedCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                <i data-feather="${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>
        `).join('');

        // Attachement des événements de filtrage
        filterWrapper.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectedCategory = e.currentTarget.dataset.category;
                renderCategoryFilters();
                renderProducts();
            });
        });

        feather.replace();
    }

    // 3. Rendu des produits
    function renderProducts() {
        productsContainer.innerHTML = '';

        if (!productsData || productsData.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-feather="frown" style="width:40px;height:40px;color:var(--text-light);margin-bottom:10px;"></i>
                    <br>
                    Aucun produit disponible pour le moment.
                </div>
            `;
            feather.replace();
            return;
        }

        // Filtrage des produits selon la catégorie sélectionnée
        const filteredProducts = selectedCategory === 'all' 
            ? productsData 
            : productsData.filter(p => p.category === selectedCategory);

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-feather="inbox" style="width:40px;height:40px;color:var(--text-light);margin-bottom:10px;"></i>
                    <br>
                    Aucun produit dans cette catégorie.
                </div>
            `;
            feather.replace();
            return;
        }

        filteredProducts.forEach(product => {
            const qty = cart[product.id] || 0;
            const card = document.createElement('div');
            card.className = 'product-card';

            const actionButtonHTML = qty > 0 ? `
                <div class="qty-pill">
                    <button class="btn-minus" data-id="${product.id}">
                        <i data-feather="minus"></i>
                    </button>
                    <span>${qty}</span>
                    <button class="btn-plus" data-id="${product.id}">
                        <i data-feather="plus"></i>
                    </button>
                </div>
            ` : `
                <button class="add-btn btn-plus" data-id="${product.id}">
                    <i data-feather="plus"></i>
                </button>
            `;

            card.innerHTML = `
                <div class="img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-desc">${product.desc}</p>
                    <div class="card-footer">
                        <div class="price">
                            <span class="currency">frc</span>
                            ${product.price.toLocaleString('fr-FR')}
                        </div>
                        ${actionButtonHTML}
                    </div>
                </div>
            `;

            productsContainer.appendChild(card);
        });

        feather.replace();
        attachProductEvents();
    }

    function attachProductEvents() {
        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                cart[id] = (cart[id] || 0) + 1;
                renderProducts();
                updateCartUI();
            });
        });

        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (cart[id] > 0) {
                    cart[id]--;
                    if (cart[id] === 0) {
                        delete cart[id];
                    }
                    renderProducts();
                    updateCartUI();
                }
            });
        });
    }

    function updateCartUI() {
        let totalItems = 0;
        let totalPrice = 0;

        for (const [id, qty] of Object.entries(cart)) {
            totalItems += qty;
            const product = productsData.find(p => p.id === id);
            if (product) {
                totalPrice += product.price * qty;
            }
        }

        document.getElementById('cart-count').textContent = totalItems;
        document.getElementById('cart-total').textContent = `${totalPrice.toLocaleString('fr-FR')} FCFA`;
        document.getElementById('btn-commander').disabled = totalItems === 0;

        renderCartModal();
    }

    function renderCartModal() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        cartItemsContainer.innerHTML = '';

        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = `
                <p style="text-align:center;color:#8e8e93;margin-top:20px;">
                    Votre panier est vide
                </p>
            `;
            return;
        }

        for (const [id, qty] of Object.entries(cart)) {
            const product = productsData.find(p => p.id === id);
            if (!product) continue;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h5>${product.name}</h5>
                    <span class="product-price">${(product.price * qty).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div class="qty-controls" style="display:flex;align-items:center;">
                    <span style="font-weight:600;margin-right:15px;">x${qty}</span>
                    <button class="delete-btn" data-id="${id}">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            `;

            cartItemsContainer.appendChild(itemEl);
        }

        feather.replace();

        cartItemsContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                delete cart[id];
                renderProducts();
                updateCartUI();
            });
        });
    }

    // Gestion du menu latéral
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function closeMenu() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    if (menuToggle && sidebar && overlay && menuClose) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        menuClose.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Gestion des modales panier et checkout
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const cartOpen = document.getElementById('cart-open');
    const btnCommander = document.getElementById('btn-commander');
    const closeCheckout = document.getElementById('close-checkout');

    if (cartOpen && cartModal) {
        cartOpen.addEventListener('click', () => {
            cartModal.classList.add('active');
        });
    }

    if (cartModal) {
        const closeCart = cartModal.querySelector('.close-modal');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                cartModal.classList.remove('active');
            });
        }
    }

    if (btnCommander && cartModal && checkoutModal) {
        btnCommander.addEventListener('click', () => {
            cartModal.classList.remove('active');
            checkoutModal.classList.add('active');
        });
    }

    if (closeCheckout && checkoutModal && cartModal) {
        closeCheckout.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            cartModal.classList.add('active');
        });
    }

    // Soumission de commande WhatsApp
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('client-name').value.trim();
            const phone = document.getElementById('client-phone').value.trim();
            const notes = document.getElementById('client-notes').value.trim();

            const now = new Date();
            const date = now.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const time = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const orderId = `CMD-${Math.floor(Math.random() * 100000)}`;
            let totalFinal = 0;

            let message = `*ELENGI FASTFOOD*\n`;
            message += `*NOUVELLE COMMANDE*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `*Commande :* ${orderId}\n`;
            message += `*Date :* ${date}\n`;
            message += `*Heure :* ${time}\n\n`;
            message += `*CLIENT*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `Nom : ${name}\n`;
            message += `Tél : ${phone}\n`;
            if (notes) message += `Note : ${notes}\n`;

            message += `\n*COMMANDE*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;

            for (const [id, qty] of Object.entries(cart)) {
                const product = productsData.find(p => p.id === id);
                if (!product) continue;

                const lineTotal = product.price * qty;
                totalFinal += lineTotal;
                message += `${qty}x ${product.name}\n`;
                message += `   ${lineTotal.toLocaleString('fr-FR')} FCFA\n`;
            }

            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `*TOTAL : ${totalFinal.toLocaleString('fr-FR')} FCFA*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `Merci pour votre commande chez ELENGI FASTFOOD.`;

            const whatsappNumber = '242067689009';
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappURL, '_blank');

            cart = {};
            renderProducts();
            updateCartUI();
            checkoutModal.classList.remove('active');
            checkoutForm.reset();
        });
    }

    // Initialisation
    renderCategoryFilters();
    renderProducts();
    updateCartUI();
});