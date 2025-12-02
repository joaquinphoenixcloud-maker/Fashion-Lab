// CONFIG (UPDATED with New Supabase Credentials)
const SUPABASE_URL = 'https://kfculpfelkfzigrptuae.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3VscGZlbGtmemlncnB0dWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzMwMjEsImV4cCI6MjA4MDIwOTAyMX0.HwFdPcWYRAwcAvAxTHceEFNQtmxpq6h01gDgfoht4es'; 

// Telegram BOT CONFIG (Assuming these are still correct for Telegram notifications)
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// Custom domain used for Supabase Auth (for phone number formatting in admin-login.js)
const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State Variables
let currentProducts = [];
let currentUser = null; 
let selectedProduct = null; 


// === UI/HELPER FUNCTIONS (Your existing functions) ===

function showSnackbar(msg, isError = false) { 
    const x = document.getElementById("snackbar"); 
    x.textContent = msg; 
    x.style.backgroundColor = isError ? '#e74c3c' : '#4CAF50';
    x.className = "show"; 
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function toggleMenu() { 
    document.getElementById('sideMenu').classList.toggle('active'); 
    document.getElementById('body').classList.toggle('menu-open');
}

function toggleSearch() { 
    const b=document.getElementById('searchBox'); 
    b.style.display=b.style.display==='block'?'none':'block'; 
    if(b.style.display === 'none') {
         document.getElementById('searchInput').value = '';
         searchProducts(); 
    }
}

function closeModal(id) { document.getElementById(id).style.display='none'; }

function searchProducts() { 
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const con = document.getElementById('productsContainer');
    // Check if container exists (only on indexOOO.html)
    if (!con) return; 

    const productCards = con.querySelectorAll('.product-card');
    if (searchTerm.length === 0) {
        productCards.forEach(card => card.style.display = 'flex');
        return;
    }
    productCards.forEach(card => {
        const productName = card.querySelector('.p-name').innerText.toLowerCase(); 
        if (productName.includes(searchTerm)) card.style.display = 'flex'; 
        else card.style.display = 'none'; 
    });
}

function switchTab(t) { 
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
    document.querySelectorAll('.menu-section').forEach(e=>e.classList.remove('active'));
    if(t==='women'){ 
        document.querySelectorAll('.tab')[0].classList.add('active'); 
        document.getElementById('women-menu').classList.add('active'); 
    }
    else { 
        document.querySelectorAll('.tab')[1].classList.add('active'); 
        document.getElementById('men-menu').classList.add('active'); 
    }
    // Load default category (All Products)
    loadProducts('all', 'All Products', t);
}

// ----------------------------------------------------
// === CORE FUNCTIONS (Customer Website Logic) ===
// NOTE: These are placeholder functions. The actual logic needs to be fully implemented 
// in your original scriptOOO.js, especially for product loading and ordering.
// ----------------------------------------------------

async function loadProducts(category, title, gender) {
    // This is the core function to fetch products for the main page
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    productsContainer.innerHTML = '<div style="text-align:center; padding:20px;">Loading products...</div>';
    
    let query = supabase.from('products').select('*').eq('is_active', true);
    
    // Filtering logic (needs refinement based on your categories)
    if (category !== 'all') {
        query = query.eq('category', category);
    }
    if (gender) {
        // Example: Only show categories that match the gender tab
        // Note: You must ensure your 'category' column contains gender info (e.g., 'women_clothing')
    }
    
    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) {
        productsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Error loading products: ' + error.message + '</div>';
        return;
    }

    currentProducts = products;
    renderProducts(products);
    // document.getElementById('sectionTitle').textContent = title; // Assuming you have a title element
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" onclick="selectProduct(${product.id})">
            <div class="p-details">
                <div class="p-name">${product.name}</div>
                <div class="p-price">${product.price} MMK</div>
                <button class="cart-btn" onclick="selectProduct(${product.id})">Order Now</button>
            </div>
        `;
        container.appendChild(card);
    });
}


async function selectProduct(productId) {
    selectedProduct = currentProducts.find(p => p.id === productId);
    if (!selectedProduct) return;

    // Display product details in the modal (Assuming your HTML has productDetailModal)
    document.getElementById('productDetailModal').style.display = 'block';
    document.getElementById('modalPName').textContent = selectedProduct.name;
    document.getElementById('modalPPrice').textContent = `${selectedProduct.price} MMK`;
    document.getElementById('modalPDesc').textContent = selectedProduct.description || 'No detailed description available.';
    document.getElementById('modalPImage').src = selectedProduct.image_url;
    document.getElementById('quantityInput').value = 1; // Reset quantity
}


async function sendOrder() {
    // 1. Collect Form Data
    const customerName = document.getElementById('nameInput').value;
    const address = document.getElementById('addressInput').value;
    const phone = document.getElementById('contactPhoneInput').value;
    const quantity = parseInt(document.getElementById('quantityInput').value);
    const note = document.getElementById('noteInput').value;
    const slipFile = document.getElementById('slipInput').files[0];

    if (!selectedProduct || !customerName || !address || !phone || quantity <= 0 || !slipFile) {
        showSnackbar('Please fill all required fields and upload the payment slip.', true);
        return;
    }
    
    document.getElementById('sendBtn').disabled = true;
    showSnackbar('Uploading slip and submitting order...', false);

    let slipUrl = '';

    // 2. Upload Payment Slip to Supabase Storage
    try {
        const filePath = `slips/${Date.now()}_${slipFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('slips') // You must create a 'slips' bucket in Supabase Storage
            .upload(filePath, slipFile);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
            .from('slips')
            .getPublicUrl(filePath);
            
        slipUrl = publicUrlData.publicUrl;
        
    } catch (error) {
        showSnackbar('Payment slip upload failed: ' + error.message, true);
        document.getElementById('sendBtn').disabled = false;
        return;
    }


    // 3. Insert Order Data to 'orders' Table
    const orderData = {
        customer_name: customerName,
        contact_phone: phone,
        delivery_address: address,
        product_name: selectedProduct.name, // Simplified: storing name instead of ID
        quantity: quantity,
        payment_slip_url: slipUrl,
        status: 'pending',
        notes: note,
        total_price: selectedProduct.price * quantity 
    };

    const { error: insertError } = await supabase
        .from('orders')
        .insert([orderData]);

    if (insertError) {
        // This is where RLS errors usually occur for anon users!
        console.error('Order Insertion Failed (Check RLS):', insertError); 
        showSnackbar('Order submission failed. (Database Error)', true);
        document.getElementById('sendBtn').disabled = false;
        return;
    }

    // 4. Send Telegram Notification (Optional but good practice)
    await sendTelegramNotification(orderData);

    // 5. Success
    closeModal('orderModal');
    document.getElementById('successModal').style.display = 'block';
    document.getElementById('sendBtn').disabled = false;
}


async function sendTelegramNotification(order) {
    const message = `
🌟 New Order Received! 🌟
----------------------------------
🛍️ Product: ${order.product_name} (${order.quantity} pcs)
💰 Total: ${order.total_price} MMK
👤 Customer: ${order.customer_name}
📞 Phone: ${order.contact_phone}
📍 Address: ${order.delivery_address}
📄 Note: ${order.notes || 'N/A'}
🖼️ Slip URL: ${order.payment_slip_url}
----------------------------------
`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.error("Telegram notification failed:", err);
        // Do not block order success for a failed notification
    }
}


function checkSlipFile() {
    const slipInput = document.getElementById('slipInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (slipInput.files.length > 0 && selectedProduct) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is the customer index page
    if (document.getElementById('productsContainer')) {
        loadProducts('all', 'All Products', 'women'); // Load initial products on startup
    }
    // No action needed for admin pages here, they have their own scripts.
});
