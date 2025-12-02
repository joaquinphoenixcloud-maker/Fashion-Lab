// admin.js (Product CRUD Logic ပါဝင်သော Code အပြည့်အစုံ)

// NOTE: SUPABASE_URL, SUPABASE_ANON_KEY နှင့် supabase client တို့ကို
// scriptOOO.js မှ ယူသုံးပါမည်။

// Helper function for UI state management (from previous turn)
function showSection(sectionId) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.menu-item[onclick*="${sectionId}"]`).classList.add('active');
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    if (sectionId === 'orders') loadOrders('all');
    else if (sectionId === 'products') loadProducts();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// === 1. ADMIN LOGIN/LOGOUT & SECURITY CHECK ===

// scriptOOO.js မှ AUTH_DOMAIN ကို ယူသုံးပါမည်ဟု ယူဆပါသည်။
const AUTH_DOMAIN = '@kshop.com'; 

async function checkAdminStatus() {
    // 1. Session ရှိ/မရှိ စစ်ပါ
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.href = 'admin-login.html';
        return false;
    }

    // 2. Profile Data (Role) ကို ဆွဲယူပြီး Admin ဟုတ်/မဟုတ် စစ်ဆေးပါ
    const { data: userProfile, error: profileError } = await supabase
        .from('profiles') // သင့်ရဲ့ User Profile Table ကို ပြောင်းပါ
        .select('role')
        .eq('id', session.user.id)
        .single();
    
    if (profileError || !userProfile || userProfile.role !== 'admin') {
        alert('Access Denied: Not authorized as Admin.');
        await supabase.auth.signOut();
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

// Logout function
async function doAdminLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout Error:', error);
    }
    window.location.href = 'admin-login.html'; 
}


// === 2. ORDER MANAGEMENT (Simplified for context) ===

async function loadOrders(statusFilter = 'all') {
    // ... Order loading logic (as provided previously) ...
    // Note: You need to define setActiveFilter function separately if not done yet
    const tableBody = document.querySelector('#ordersTable tbody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading orders...</td></tr>';
    
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }
    
    const { data: orders, error } = await query;
    if (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Error loading orders: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = ''; 
    orders.forEach(order => {
        const row = tableBody.insertRow();
        const date = new Date(order.created_at).toLocaleDateString();
        row.insertCell().textContent = date;
        row.insertCell().textContent = `${order.customer_name} (${order.contact_phone})`;
        const itemCell = row.insertCell();
        itemCell.innerHTML = `<strong>${order.product_name}</strong> - ${order.quantity} pcs <br><small>Address: ${order.delivery_address}</small>`; 
        row.insertCell().innerHTML = `<span class="status-badge status-${order.status}">${order.status}</span>`;
        
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
    } else {
        alert(`Order ${orderId} status updated to ${newStatus}`);
        loadOrders(document.querySelector('.filter-btn.active').textContent.toLowerCase().split('(')[0].trim());
    }
}


// === 3. PRODUCT MANAGEMENT (CRUD LOGIC) ===

// 3.1. Load Products Table
async function loadProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '<tr><td colspan="5">Loading products...</td></tr>';

    const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Error loading products: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    products.forEach(product => {
        const row = tableBody.insertRow();
        
        row.insertCell().innerHTML = `<img src="${product.image_url}" style="width:50px; height:50px; object-fit:cover;">`;
        row.insertCell().textContent = product.name;
        row.insertCell().textContent = `${product.price} MMK`;
        row.insertCell().textContent = product.category;
        
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button onclick="editProduct(${product.id})">Edit</button>
            <button onclick="deleteProduct(${product.id})" style="background:var(--accent-color);">Delete</button>
        `;
    });
}

// 3.2. Open modal for adding or editing
function openProductModal(product = null) {
    const pIdInput = document.getElementById('pId');
    const title = document.getElementById('modal-title');
    const pName = document.getElementById('pName');
    const pCategory = document.getElementById('pCategory');
    const pPrice = document.getElementById('pPrice');
    const pImageUrl = document.getElementById('pImageUrl');
    const pDescription = document.getElementById('pDescription');

    if (product) {
        // Edit Mode
        title.textContent = 'Edit Product: ' + product.name;
        pIdInput.value = product.id;
        pName.value = product.name;
        pCategory.value = product.category;
        pPrice.value = product.price;
        pImageUrl.value = product.image_url;
        pDescription.value = product.description || '';
    } else {
        // Add Mode
        title.textContent = 'Add New Product';
        pIdInput.value = '';
        pName.value = '';
        pCategory.value = 'women_clothing';
        pPrice.value = '';
        pImageUrl.value = '';
        pDescription.value = '';
    }
    
    document.getElementById('productModal').style.display = 'block';
}

// 3.3. Function to fetch product data and open modal in edit mode
async function editProduct(productId) {
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
    
    if (error) {
        alert('Error fetching product data for edit: ' + error.message);
        return;
    }

    openProductModal(product);
}

// 3.4. Function to save (insert or update) the product
async function saveProduct() {
    const pId = document.getElementById('pId').value;
    const pName = document.getElementById('pName').value;
    const pCategory = document.getElementById('pCategory').value;
    const pPrice = document.getElementById('pPrice').value;
    const pImageUrl = document.getElementById('pImageUrl').value;
    const pDescription = document.getElementById('pDescription').value;

    if (!pName || !pPrice || !pImageUrl) {
        alert('Product Name, Price, and Image URL တွေ ဖြည့်ပေးပါ။');
        return;
    }

    const productData = {
        name: pName,
        category: pCategory,
        price: parseFloat(pPrice),
        image_url: pImageUrl,
        description: pDescription,
        is_active: true
    };

    let error;
    
    if (pId) {
        // UPDATE Existing Product
        const response = await supabase
            .from('products')
            .update(productData)
            .eq('id', pId);
        error = response.error;
    } else {
        // INSERT New Product
        const response = await supabase
            .from('products')
            .insert(productData);
        error = response.error;
    }

    if (error) {
        alert('Product save failed: ' + error.message);
    } else {
        alert('Product saved successfully!');
        closeModal('productModal');
        loadProducts(); // Refresh list
    }
}

// 3.5. Function to delete a product
async function deleteProduct(productId) {
    if (!confirm('ဒီပစ္စည်းကို ဖျက်ပစ်မှာ သေချာပါသလား? ပြန်ဖော်လို့ မရတော့ပါဘူး။')) {
        return;
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        alert('Product deletion failed: ' + error.message);
    } else {
        alert('Product deleted successfully!');
        loadProducts(); // Refresh list
    }
}


// === 4. INITIALIZATION ===

document.addEventListener('DOMContentLoaded', async () => {
    // Admin Check လုပ်ပြီးမှသာ Panel ကို စတင် Load လုပ်ပါ
    const isAdmin = await checkAdminStatus();
    if (isAdmin) {
        // Admin ဟုတ်မှသာ Orders Section ကို Load လုပ်ပါ
        showSection('orders');
    }
});
