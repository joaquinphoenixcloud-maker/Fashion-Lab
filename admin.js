// admin.js

// === 1. UI FUNCTIONS ===

// Menu item ကို ပြောင်းလဲခြင်း
function showSection(sectionId) {
    // Menu active state ပြောင်းခြင်း
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[onclick*="${sectionId}"]`).classList.add('active');

    // Section မျက်နှာပြင်ပြောင်းခြင်း
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // Data များကို Load လုပ်ခြင်း
    if (sectionId === 'orders') loadOrders('all');
    else if (sectionId === 'products') loadProducts();
}

// Order Status Filter ကို ပြောင်းလဲခြင်း
function setActiveFilter(filterName) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[onclick*="'${filterName}'"]`).classList.add('active');
}

function openProductModal(product = null) {
    // ... Product Add/Edit Modal ကို ဖွင့်ရန် Logic ...
    // ... (Modal မှာ ဖြည့်စရာရှိတဲ့ Input တွေကို ထည့်ပြီးမှ ဒီမှာ Logic ရေးပါ) ...
    document.getElementById('productModal').style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}


// === 2. ORDER MANAGEMENT ===

async function loadOrders(statusFilter = 'all') {
    setActiveFilter(statusFilter);
    const tableBody = document.querySelector('#ordersTable tbody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading orders...</td></tr>';
    
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    // Filter လုပ်ရန်
    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }
    
    const { data: orders, error } = await query;

    if (error) {
        console.error('Error fetching orders:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Error loading orders: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = ''; 
    orders.forEach(order => {
        const row = tableBody.insertRow();
        const date = new Date(order.created_at).toLocaleDateString();
        
        row.insertCell().textContent = date;
        row.insertCell().textContent = `${order.customer_name} (${order.contact_phone})`;
        
        // မှာထားတဲ့ ပစ္စည်းအကြောင်းအရာကို ထည့်ရန်
        const itemCell = row.insertCell();
        // Assuming 'product_details' in order table is a JSON object or string
        itemCell.innerHTML = `
            <strong>${order.product_name}</strong> - ${order.quantity} pcs <br>
            <small>Address: ${order.delivery_address}</small>
        `; 
        
        row.insertCell().innerHTML = `<span class="status-badge status-${order.status}">${order.status}</span>`;
        
        // Action Button
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <select onchange="updateOrderStatus(${order.id}, this.value)">
                <option value="${order.status}" selected disabled>${order.status}</option>
                <option value="pending">Pending</option>
                <option value="coming">Coming</option>
                <option value="owned">Owned</option>
                <option value="reject">Reject</option>
            </select>
        `;
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        alert('Status update failed: ' + error.message);
        console.error('Update Error:', error);
    } else {
        alert(`Order ${orderId} status updated to ${newStatus}`);
        // ဇယားကို Refresh လုပ်ရန်
        loadOrders(document.querySelector('.filter-btn.active').textContent.toLowerCase().split('(')[0].trim());
    }
}


// === 3. PRODUCT MANAGEMENT ===

async function loadProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading products...</td></tr>';

    // products table ထဲက data အားလုံးဆွဲရန် (currentProducts ကို Customer script ကနေ ပြန်သုံးလို့ရတယ်)
    const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Error loading products: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    products.forEach(product => {
        const row = tableBody.insertRow();
        
        // Image Cell
        row.insertCell().innerHTML = `<img src="${product.image_url}" style="width:50px; height:50px; object-fit:cover;">`;
        
        row.insertCell().textContent = product.name;
        row.insertCell().textContent = `${product.price} MMK`;
        row.insertCell().textContent = product.category;
        
        // Action Buttons
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button onclick="editProduct(${product.id})">Edit</button>
            <button onclick="deleteProduct(${product.id})" style="background:var(--accent-color);">Delete</button>
        `;
    });
}

// ... (editProduct, deleteProduct, saveProduct functions တွေကို ထပ်ဖြည့်ရပါမယ်) ...

// === 4. ADMIN LOGIN/LOGOUT (For Security) ===

function doAdminLogout() {
    // Customer script ထဲက doLogout() ကို Admin အတွက်ပါ ပြန်သုံးပါ
    doLogout(); 
    // Login မျက်နှာပြင်ဆီကို ပြန်ပို့ရန် (သင့်မှာ admin login page တစ်ခုရှိရပါမယ်)
    window.location.href = 'admin-login.html'; 
}

// မျက်နှာပြင် စတင်သည်နှင့် Orders ကို အရင် Load လုပ်ရန်
document.addEventListener('DOMContentLoaded', () => {
    // Admin လားဆိုတာ စစ်ဆေးတဲ့ Logic ကိုလည်း ဒီနေရာမှာ ထည့်သွင်းသင့်ပါတယ်။
    // လောလောဆယ်တော့ UI ကို အရင် Load လုပ်ပါမယ်။
    showSection('orders');
});
