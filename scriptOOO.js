// CONFIG
const SUPABASE_URL = 'https://hfsvxmnhoylhzbzvamiq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc3Z4bW5ob3lsaHpienZhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjIzNzEsImV4cCI6MjA3OTEzODM3MX0.J37qWQaKqecVsmGWWj63CyClVDup6KAD24iZVjIIL-0'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// NEW: Admin configuration
const ADMIN_USERNAME = 'fashion_admin';
const ADMIN_PASSWORD = 'admin@password'; // Production မှာ ခက်ခက်ခဲခဲ password ထားပါ
let isAdmin = false; 

// Custom domain used for Supabase Auth (OTP will use the phone number directly if phone auth is enabled in Supabase)
// NOTE: If Supabase Phone Auth is disabled, this code will fail.
// We are assuming Phone Auth is enabled in the Supabase project.
const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 
// Variable to hold the phone number during OTP flow
let tempPhoneNumber = ''; 
let slipFile = null;

// --- TRANSLATION MAP (EN, MY, TH) ---
const currentTranslations = {
    en: {
        all: "All Products", clothing: "Clothing", shoes: "Shoes", accessories: "Accessories",
        home: "Home", history: "History", settings: "Settings", chat: "Chat", shop_cat: "SHOP CATEGORY",
        login_title: "Login / Register", phone_label: "Phone Number", send_otp: "Send OTP",
        otp_sent: "OTP sent to your phone. Check your messages.", otp_label: "OTP Code", verify_otp: "Verify OTP",
        welcome: "Welcome!", name_label: "Name", update_profile: "Update Profile", logout_btn: "Logout",
        order_title: "Order Details", address_label: "Delivery Address", contact_label: "Contact Phone", note_label: "Note",
        slip_label: "Payment Slip", send_btn: "Send Order to Admin", history_title: "Order History",
        chat_title: "Chat with Admin", settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language",
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        search_placeholder: "Search...", chat_reply: "Hello! How can I help you today?",
        // NEW ADMIN TRANSLATIONS
        admin_title: "Admin Dashboard", pending_orders: "Pending Orders" 
    },
    my: {
        all: "ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", accessories: "အသုံးအဆောင်",
        home: "ပင်မစာမျက်နှာ", history: "မှာယူမှုမှတ်တမ်း", settings: "ပြင်ဆင်မှု", chat: "ချက်တင်", shop_cat: "ဆိုင်ခွဲများ",
        login_title: "ဝင်ရန် / မှတ်ပုံတင်ရန်", phone_label: "ဖုန်းနံပါတ်", send_otp: "OTP ပို့ပါ",
        otp_sent: "သင့်ဖုန်းသို့ OTP ပို့လိုက်ပါသည်။ စစ်ဆေးပါ။", otp_label: "OTP ကုတ်", verify_otp: "OTP စစ်ဆေးပါ",
        welcome: "ကြိုဆိုပါတယ်!", name_label: "နာမည်", update_profile: "ကိုယ်ရေးအချက်အလက်ပြင်မည်", logout_btn: "ထွက်ရန်",
        order_title: "မှာယူမှု အသေးစိတ်", address_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "အကြောင်းအရာ",
        slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်", history_title: "မှာယူမှုမှတ်တမ်း",
        chat_title: "Admin နှင့် စကားပြောရန်", settings_title: "ပြင်ဆင်မှုများ", dark_mode: "အမှောင်စနစ်", language_title: "ဘာသာစကား",
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်! ", order_sent_p: "ငွေပေးချေမှုအောင်မြင်ပါပြီ၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "အိုကေ",
        search_placeholder: "ရှာဖွေပါ...", chat_reply: "မင်္ဂလာပါ... ဘာကူညီပေးရမလဲရှင့်?",
        // NEW ADMIN TRANSLATIONS
        admin_title: "အက်ဒမင် စီမံခန့်ခွဲမှု", pending_orders: "စောင့်ဆိုင်းနေသော အော်ဒါများ"
    },
    th: {
        all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", accessories: "อุปกรณ์เสริม",
        home: "หน้าหลัก", history: "ประวัติการสั่งซื้อ", settings: "ตั้งค่า", chat: "แชท", shop_cat: "หมวดหมู่ร้านค้า",
        login_title: "เข้าสู่ระบบ / ลงทะเบียน", phone_label: "เบอร์โทรศัพท์", send_otp: "ส่ง OTP",
        otp_sent: "ส่ง OTP ไปยังโทรศัพท์ของคุณแล้ว ตรวจสอบข้อความ", otp_label: "รหัส OTP", verify_otp: "ยืนยัน OTP",
        welcome: "ยินดีต้อนรับ!", name_label: "ชื่อ", update_profile: "อัปเดตโปรไฟล์", logout_btn: "ออกจากระบบ",
        order_title: "รายละเอียดการสั่งซื้อ", address_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์โทรติดต่อ", note_label: "บันทึก",
        slip_label: "สลิปการชำระเงิน", send_btn: "ส่งคำสั่งซื้อถึงแอดมิน", history_title: "ประวัติการสั่งซื้อ",
        chat_title: "แชทกับแอดมิน", settings_title: "การตั้งค่า", dark_mode: "โหมดมืด", language_title: "ภาษา",
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะดำเนินการจัดส่งเร็วๆ นี้🎉", ok_btn: "ตกลง",
        search_placeholder: "ค้นหา...", chat_reply: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ?",
        // NEW ADMIN TRANSLATIONS
        admin_title: "แผงควบคุมผู้ดูแลระบบ", pending_orders: "คำสั่งซื้อที่รอดำเนินการ"
    }
};

let currentLang = localStorage.getItem('kshop_lang') || 'en';

// --- UTILITY FUNCTIONS ---
function showSnackbar(message, type = 'info') {
    const sb = document.getElementById("snackbar");
    sb.innerText = message;
    sb.className = "show";
    
    // Reset background color first
    sb.style.backgroundColor = '#333';
    
    if (type === 'error') {
        sb.style.backgroundColor = '#d32f2f'; // Red for errors
    } else if (type === 'success') {
        sb.style.backgroundColor = '#4CAF50'; // Green for success
    } else {
        sb.style.backgroundColor = '#333'; // Default
    }

    setTimeout(() => { sb.className = sb.className.replace("show", ""); }, 3000);
}

// --- LANGUAGE AND THEME ---
function applyLanguage(lang) {
    const t = currentTranslations[lang];
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) {
            el.innerText = t[key];
        }
    });
    document.getElementById('searchInput').placeholder = t.search_placeholder;
    document.getElementById('chatBox').querySelector('.bot-message').innerText = t.chat_reply;
}

function toggleLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kshop_lang', lang);
    applyLanguage(lang);
    
    // Reload product names in current view
    if (currentProducts.length > 0) {
        // Find the current category and title being displayed
        const currentTitle = document.getElementById('currentCategoryTitle').innerText;
        
        // Find the matching key in the new language to reload with correct title
        let categoryKey = 'all';
        for (const key in currentTranslations.en) {
            if (currentTranslations.en[key] === currentTitle) {
                categoryKey = key;
                break;
            }
        }
        
        const currentGender = document.getElementById('women-menu').classList.contains('active') ? 'women' : 'men';
        loadProducts(categoryKey, currentTranslations[currentLang][categoryKey], currentGender);
    }
}

function openSettings() { document.getElementById('settingsModal').style.display = 'flex'; }
function toggleTheme(cb) { 
    document.body.classList.toggle('dark-mode', cb.checked); 
    localStorage.setItem('kshop_dark_mode', cb.checked ? 'on' : 'off');
}

// --- NAVIGATION / UI ---
function toggleMenu() { 
    document.getElementById('sideMenu').classList.toggle('active'); 
    document.querySelector('.overlay').classList.toggle('active'); 
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
        loadProducts('all', currentTranslations[currentLang].all, 'women');
    }
    else { 
        document.querySelectorAll('.tab')[1].classList.add('active'); 
        document.getElementById('men-menu').classList.add('active'); 
        loadProducts('all', currentTranslations[currentLang].all, 'men');
    }
    toggleMenu();
}

// --- ADMIN FUNCTIONS ---
function checkAdmin() {
    document.getElementById('adminModal').style.display = 'flex';
    if(isAdmin) {
        showAdminDashboard();
    } else {
        document.getElementById('adminAuth').style.display = 'block';
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('adminIdInput').value = '';
        document.getElementById('adminPasswordInput').value = '';
    }
}

function adminLogin() {
    const id = document.getElementById('adminIdInput').value.trim();
    const pass = document.getElementById('adminPasswordInput').value.trim();
    
    if (id === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('kshop_admin', 'true');
        showSnackbar("Admin Login Successful!", 'success');
        showAdminDashboard();
    } else {
        showSnackbar("Invalid Admin Credentials.", 'error');
    }
}

function doAdminLogout() {
    isAdmin = false;
    localStorage.removeItem('kshop_admin');
    closeModal('adminModal');
    showSnackbar("Admin Logged out.", 'success');
}

async function showAdminDashboard() {
    document.getElementById('adminAuth').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    
    const con = document.getElementById('pendingOrdersList');
    con.innerHTML = '<p style="text-align:center;">Loading orders...</p>';
    
    let { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'owned') // Show everything that is NOT 'owned' (i.e. pending, coming, reject)
        .order('created_at', {ascending:false});
        
    if(error) { con.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}</p>`; return; }
    
    if(!data || data.length === 0) { con.innerHTML = '<p style="text-align:center;">No pending orders.</p>'; return; }
    
    let html = '';
    data.forEach(o => {
        let statusColor = '#333';
        if(o.status === 'reject') statusColor = '#d32f2f'; 
        else if(o.status === 'coming') statusColor = '#ffc107'; 
        else if(o.status === 'pending') statusColor = '#03a9f4';
        
        html += `
            <div class="history-item" style="flex-direction:column; align-items:flex-start; margin-bottom:15px; border:1px solid #ddd; padding:10px;">
                <div style="font-size:16px; font-weight:bold; margin-bottom:5px;">Order #${o.id} - <span style="color:${statusColor};">${o.status.toUpperCase()}</span></div>
                <small>👤 ${o.customer_name} | 📞 ${o.customer_phone}</small><br>
                <small>🏠 ${o.address}</small><br>
                <small>📝 ${o.note}</small><br>
                <div style="margin-top:5px; padding:5px; border-top:1px dashed #eee; width:100%;">
                    ${o.item_name} - <b>${o.price}</b>
                </div>
                <div style="display:flex; gap:5px; margin-top:10px; width:100%;">
                    <button style="flex:1; padding:8px; border:none; border-radius:4px; cursor:pointer; background:#4CAF50; color:white;" onclick="updateOrderStatus(${o.id}, 'owned')">Owned</button>
                    <button style="flex:1; padding:8px; border:none; border-radius:4px; cursor:pointer; background:#03a9f4; color:white;" onclick="updateOrderStatus(${o.id}, 'coming')">Coming</button>
                    <button style="flex:1; padding:8px; border:none; border-radius:4px; cursor:pointer; background:#f44336; color:white;" onclick="updateOrderStatus(${o.id}, 'reject')">Reject</button>
                </div>
            </div>
        `;
    });
    con.innerHTML = html;
}

async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
    if(error) {
        showSnackbar(`Error updating order #${orderId}: ${error.message}`, 'error');
    } else {
        showSnackbar(`Order #${orderId} status updated to ${newStatus}.`, 'success');
        showAdminDashboard(); // Refresh the dashboard
    }
}


// --- DATA LOADING ---
async function loadProducts(category, title, gender) {
    document.getElementById('currentCategoryTitle').innerText = title;
    const con = document.getElementById('productsContainer');
    con.innerHTML = '<div>Loading products...</div>';
    
    let query = supabase.from('products').select('*').eq('gender', gender);
    if(category !== 'all') {
        query = query.eq('category', category);
    }
    
    let { data, error } = await query;
    
    if (error) {
        con.innerHTML = `<div style="color:red;">Error loading products: ${error.message}</div>`;
        showSnackbar(`Error loading products.`, 'error');
        return;
    }

    currentProducts = data;
    con.innerHTML = '';
    
    if (data && data.length > 0) {
        data.forEach(p => {
            const translatedName = p.name_translations ? JSON.parse(p.name_translations)[currentLang] || p.name : p.name;
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.image_url}" alt="${translatedName}">
                <div class="p-name">${translatedName}</div>
                <div class="p-price">${p.price}</div>
                <button class="buy-btn" onclick="openDetailModal(${p.id})">Details</button>
            `;
            con.appendChild(card);
        });
    } else {
        con.innerHTML = '<div style="text-align:center; padding:20px;">No products found in this category.</div>';
    }
}

async function loadBanners() {
    const con = document.getElementById('bannerContainer');
    let { data, error } = await supabase.from('banners').select('*').order('id');
    
    if (error) {
        con.innerHTML = '';
        return;
    }
    
    if (data && data.length > 0) {
        con.innerHTML = data.map(b => `<img src="${b.image_url}" alt="Banner" class="banner-img">`).join('');
    }
}


// --- AUTHENTICATION ---
function updateUserUI() {
    const userDot = document.getElementById('userDot');
    if (currentUser) {
        userDot.style.display = 'block';
    } else {
        userDot.style.display = 'none';
    }
    
    const profileDisplay = document.getElementById('profileDisplay');
    const nameInput = document.getElementById('nameInput');
    const profileContent = document.getElementById('profileContent');
    const authContent = document.getElementById('authContent');
    const otpContent = document.getElementById('otpContent');
    
    if (currentUser) {
        profileDisplay.innerText = `${currentUser.name} (${currentUser.phone})`;
        nameInput.value = currentUser.name;
        profileContent.style.display = 'block';
        authContent.style.display = 'none';
        otpContent.style.display = 'none';
    } else {
        profileContent.style.display = 'none';
        authContent.style.display = 'block';
        otpContent.style.display = 'none';
    }
}

async function loadUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        await fetchUserProfile(session.user.id);
    }
}

async function fetchUserProfile(userId) {
    let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        showSnackbar(`Error fetching profile: ${error.message}`, 'error');
        currentUser = null;
    } else if (data) {
        currentUser = data;
    } else {
        // User exists in auth but not in 'users' table (New user)
        currentUser = { id: userId, phone: supabase.auth.getUser().user.phone, name: '' };
    }
}

function openDetailModal(productId) {
    selectedProduct = currentProducts.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    const translatedName = selectedProduct.name_translations ? JSON.parse(selectedProduct.name_translations)[currentLang] || selectedProduct.name : selectedProduct.name;
    const translatedDesc = selectedProduct.description_translations ? JSON.parse(selectedProduct.description_translations)[currentLang] || selectedProduct.description : selectedProduct.description;

    document.getElementById('productDetail').innerHTML = `
        <img src="${selectedProduct.image_url}" alt="${translatedName}" style="width:100%; height:300px; object-fit:cover; margin-bottom:15px; border-radius:8px;">
        <h3>${translatedName}</h3>
        <p style="color:var(--accent-color); font-size:18px; font-weight:bold; margin:10px 0;">${selectedProduct.price}</p>
        <p>${translatedDesc}</p>
        <button class="order-btn" onclick="openOrderModal()" style="margin-top:20px;">Order Now</button>
    `;
    document.getElementById('detailModal').style.display = 'flex';
}

function checkAuth() {
    document.getElementById('authModal').style.display = 'flex';
    updateUserUI();
}

async function sendOTP() {
    const phoneInput = document.getElementById('phoneInput').value.trim();
    if (!phoneInput) { showSnackbar('Please enter your phone number.', 'error'); return; }
    
    // Format phone number for Supabase (e.g., +959xxxxxxxxx)
    let formattedPhone = phoneInput.startsWith('09') ? '+95' + phoneInput.substring(1) : phoneInput;
    if (!formattedPhone.startsWith('+')) { formattedPhone = '+' + formattedPhone; }
    
    tempPhoneNumber = formattedPhone;
    
    try {
        const { error } = await supabase.auth.signInWithOtp({ 
            phone: tempPhoneNumber,
            options: {
                // If you use AUTH_DOMAIN, Supabase will append it to the phone number for unique user ID.
                email: tempPhoneNumber + AUTH_DOMAIN
            }
        });

        if (error) {
            showSnackbar(`Error sending OTP: ${error.message}`, 'error');
            console.error('OTP Error:', error);
            return;
        }

        document.getElementById('authContent').style.display = 'none';
        document.getElementById('otpContent').style.display = 'block';
        showSnackbar('OTP sent successfully!', 'success');
        
    } catch (e) {
        showSnackbar('An unexpected error occurred.', 'error');
        console.error('Sign In Error:', e);
    }
}

async function verifyOTP() {
    const otpInput = document.getElementById('otpInput').value.trim();
    if (!otpInput) { showSnackbar('Please enter the OTP code.', 'error'); return; }

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: tempPhoneNumber,
            token: otpInput,
            type: 'sms'
        });

        if (error) {
     
