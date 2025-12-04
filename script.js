// CONFIG
const SUPABASE_URL = 'https://kfculpfelkfzigrptuae.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3VscGZlbGtmemlncnB0dWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzMwMjEsImV4cCI6MjA4MDIwOTAyMX0.HwFdPcWYRAwcAvAxTHceEFNQtmxpq6h01gDgfoht4es'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
// currentUser now stores the profile data fetched from the 'users' table
let currentUser = null; 
let selectedProduct = null; 

// --- TRANSLATION MAP (EN, MY, TH) ---
const currentTranslations = {
    en: {
        shop_cat: "WOMEN'S FASHION", all: "All Products", clothing: "Clothing", shoes: "Shoes", bag: "Bags",
        men_cat: "MEN'S FASHION", accessories: "Accessories",
        order_form: "Order Form", address_label: "Delivery Address", contact_label: "Contact Phone",
        note_label: "Note", slip_label: "Payment Slip", send_btn: "Send to Admin",
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language",
        chat_title: "Support Chat",
        login_tab: "Login", register_tab: "Register", name_label: "Name", user_id_label: "User ID",
        pass_label: "OTP Code", login_btn: "Send OTP Code", register_btn: "Send OTP Code",
        logout_btn: "Logout", history_title: "My Orders"
    },
    my: {
        shop_cat: "အမျိုးသမီးဖက်ရှင်", all: "ကုန်ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", bag: "အိတ်",
        men_cat: "အမျိုးသားဖက်ရှင်", accessories: "ဆက်စပ်ပစ္စည်း",
        order_form: "မှာယူမှုပုံစံ", address_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း",
        note_label: "မှတ်စု", slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်",
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်ပါသည်!", order_sent_p: "ငွေပေးချေမှု အောင်မြင်ပြီး၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "အိုကေ",
        settings_title: "ချိန်ညှိချက်များ", dark_mode: "အမှောင် Mode", language_title: "ဘာသာစကား",
        chat_title: "အကူအညီ Chat",
        login_tab: "ဝင်ရောက်ရန်", register_tab: "အကောင့်လျှောက်ရန်", name_label: "အမည်", user_id_label: "User ID",
        pass_label: "OTP ကုဒ်", login_btn: "OTP ကုဒ်ပို့ရန်", register_btn: "OTP ကုဒ်ပို့ရန်",
        logout_btn: "ထွက်ရန်", history_title: "ကျွန်ုပ်၏မှာယူမှုများ"
    },
    th: {
        shop_cat: "แฟชั่นสตรี", all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", bag: "กระเป๋า",
        men_cat: "แฟชั่นบุรุษ", accessories: "เครื่องประดับ",
        order_form: "แบบฟอร์มสั่งซื้อ", address_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์ติดต่อ",
        note_label: "หมายเหตุ", slip_label: "สลิปการโอน", send_btn: "ส่งให้แอดมิน",
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะจัดส่งให้เร็วที่สุด 🎉", ok_btn: "ตกลง",
        settings_title: "การตั้งค่า", dark_mode: "โหมดมืด", language_title: "ภาษา",
        chat_title: "แชทสนับสนุน",
        login_tab: "เข้าสู่ระบบ", register_tab: "ลงทะเบียน", name_label: "ชื่อ", user_id_label: "User ID",
        pass_label: "รหัส OTP", login_btn: "ส่งรหัส OTP", register_btn: "ส่งรหัส OTP",
        logout_btn: "ออกจากระบบ", history_title: "คำสั่งซื้อของฉัน"
    }
};
let currentLang = 'en'; // Default language

// --- GENERAL UTILITY FUNCTIONS ---

function showSnackbar(message, type = 'info') {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show ' + type;
    setTimeout(function(){ snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.classList.remove('modal-open');
}

// --- LANGUAGE AND THEME FUNCTIONS ---

function updateTexts() {
    const texts = currentTranslations[currentLang];
    document.querySelectorAll('[data-t]').forEach(element => {
        const key = element.getAttribute('data-t');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });
}

function toggleLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateTexts();
    showSnackbar(`Language set to ${lang.toUpperCase()}`, 'info');
}

function toggleTheme(checkbox) {
    if (checkbox.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function loadSettings() {
    const savedLang = localStorage.getItem('language') || 'en';
    currentLang = savedLang;
    document.getElementById('langSelect').value = savedLang;
    updateTexts();

    const savedTheme = localStorage.getItem('theme');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
    }
}

function openSettings() {
    openModal('settingsModal');
}

// --- AUTHENTICATION FUNCTIONS (USER ID/NAME LOGIC) ---

function showAuthForm(formType) {
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Tab များကို စီမံခြင်း (Managing Tabs)
    if (formType === 'login') {
        tabLogin.style.borderBottom = '2px solid #2d2d2d';
        tabLogin.style.fontWeight = 'bold';
        tabLogin.style.color = 'var(--text-color)';
        
        tabRegister.style.borderBottom = 'none';
        tabRegister.style.fontWeight = 'normal';
        tabRegister.style.color = '#777';
        
        // Form များကို ဖျောက်/ပေါ် လုပ်ခြင်း (Show/Hide Forms)
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        
    } else if (formType === 'register') {
        tabRegister.style.borderBottom = '2px solid #2d2d2d';
        tabRegister.style.fontWeight = 'bold';
        tabRegister.style.color = 'var(--text-color)';
        
        tabLogin.style.borderBottom = 'none';
        tabLogin.style.fontWeight = 'normal';
        tabLogin.style.color = '#777';
        
        // Form များကို ဖျောက်/ပေါ် လုပ်ခြင်း (Show/Hide Forms)
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

async function checkAuth() {
    // Local storage ကနေ user ID ကို ယူမယ်
    const savedUserId = localStorage.getItem('currentUserId');
    
    if (savedUserId) {
        // User ရှိရင် profile နဲ့ order history ကို ဖွင့်မယ်
        await fetchUserProfile(savedUserId);
        if (currentUser) {
             // Admin ဆိုရင် admin page ကိုပို့
            if (currentUser.is_admin) {
                window.location.href = 'admin.html';
                return;
            }
            document.getElementById('userDot').style.display = 'block';
            loadOrderHistory();
            openModal('historyModal');
            return;
        }
    }
    
    // User မရှိရင် Login Modal ဖွင့်မယ်
    document.getElementById('userDot').style.display = 'none';
    openModal('authModal');
    // Default အနေနဲ့ Login Tab ကို ဖွင့်ပေးမယ်
    showAuthForm('login'); 
}

async function fetchUserProfile(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        showSnackbar('Error fetching user profile: ' + error.message, 'error');
        currentUser = null;
        return;
    }
    
    currentUser = data;
    // User ID မှန်ပေမဲ့ Supabase မှာ မရှိရင် (data က null) ဆိုရင် currentUser က null ဖြစ်နေမယ်
}

async function sendOtp(formType) {
    // NOTE: Supabase မှာ OTP logic က email သို့မဟုတ် phone ကို အခြေခံတာပါ။ 
    // ဒီမှာတော့ OTP code ကို hardcode လုပ်ထားပြီး User ID ကို သုံးပြီး user profile ကို စစ်ဆေးပါမယ်။ 
    // Production မှာတော့ တကယ့် OTP စနစ်ကို သုံးသင့်ပါတယ်။
    
    const userIdInput = document.getElementById(formType === 'login' ? 'lUserId' : 'rUserId');
    const userId = userIdInput.value.trim();
    
    if (!userId) {
        showSnackbar("Please enter a User ID.", 'error');
        return;
    }

    if (formType === 'register') {
        const name = document.getElementById('rName').value.trim();
        if (!name) {
             showSnackbar("Please enter your Name.", 'error');
             return;
        }
    }

    // 1. User ID ရှိ/မရှိ စစ်ဆေးမယ်
    await fetchUserProfile(userId);
    
    if (formType === 'login') {
        // Login လုပ်ရင် User ID ရှိရမယ်
        if (!currentUser) {
            showSnackbar(`User ID: ${userId} not found. Please register.`, 'error');
            return;
        }
    } else if (formType === 'register') {
        // Register လုပ်ရင် User ID မရှိရဘူး
        if (currentUser) {
            showSnackbar(`User ID: ${userId} is already taken. Try logging in.`, 'error');
            return;
        }
    }

    // 2. OTP ပို့တဲ့ပုံစံမျိုး လုပ်ဆောင်မယ်
    // ဒီနေရာမှာ Backend ကနေ အမှန်တကယ် OTP ပို့တဲ့ API ကို ခေါ်ရပါမယ်။ 
    // ဒါပေမဲ့ Demo အတွက် OTP Code က '1234' လို့ သတ်မှတ်လိုက်ပါမယ်။
    showSnackbar(`OTP Code '1234' sent to the contact associated with ${userId}.`, 'success');
    
    // 3. OTP verification နေရာကို ဖွင့်ပေးမယ်
    if (formType === 'login') {
        document.getElementById('verifyOtpLogin').style.display = 'block';
        document.getElementById('sendOtpBtn').style.display = 'none';
    } else {
        document.getElementById('verifyOtpRegister').style.display = 'block';
        document.getElementById('sendOtpRegisterBtn').style.display = 'none';
    }
}

async function verifyOtp(formType) {
    const otpInput = document.getElementById(formType === 'login' ? 'lOtp' : 'rOtp');
    const otpCode = otpInput.value.trim();
    const userId = document.getElementById(formType === 'login' ? 'lUserId' : 'rUserId').value.trim();
    
    if (otpCode !== '1234') { // Hardcoded OTP check
        showSnackbar("Invalid OTP Code.", 'error');
        return;
    }

    if (formType === 'login') {
        // Login Success
        localStorage.setItem('currentUserId', userId);
        await fetchUserProfile(userId); // Current user profile ကို load မယ်
        closeModal('authModal');
        showSnackbar("Login successful!", 'success');
        
        if (currentUser && currentUser.is_admin) {
             window.location.href = 'admin.html'; // Admin ဆိုရင် admin page ကိုပို့
        } else {
            // General user ဆိုရင် history modal ကို ဖွင့်မယ်
            checkAuth(); 
        }

    } else if (formType === 'register') {
        const name = document.getElementById('rName').value.trim();
        
        // Register Success: New user ကို Supabase ထဲ ထည့်မယ်
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ user_id: userId, name: name, is_admin: false }])
            .select()
            .single();

        if (error) {
            showSnackbar('Registration failed: ' + error.message, 'error');
            return;
        }

        // Login ဝင်လိုက်မယ်
        localStorage.setItem('currentUserId', userId);
        currentUser = newUser;
        closeModal('authModal');
        showSnackbar(`Registration successful! Welcome, ${name}.`, 'success');
        checkAuth(); // History modal ကို ဖွင့်မယ်
    }
    
    // Form ရှင်းလင်းခြင်း
    document.getElementById('lUserId').value = '';
    document.getElementById('lOtp').value = '';
    document.getElementById('rName').value = '';
    document.getElementById('rUserId').value = '';
    document.getElementById('rOtp').value = '';
    document.getElementById('verifyOtpLogin').style.display = 'none';
    document.getElementById('sendOtpBtn').style.display = 'block';
    document.getElementById('verifyOtpRegister').style.display = 'none';
    document.getElementById('sendOtpRegisterBtn').style.display = 'block';
}

function doLogout() {
    currentUser = null;
    localStorage.removeItem('currentUserId');
    document.getElementById('userDot').style.display = 'none';
    closeModal('historyModal');
    showSnackbar('You have been logged out.', 'info');
}

// ... (Rest of the functions like loadProducts, searchProducts, etc. remain the same) ...

// ** loadOrderHistory Function (Order history for the logged-in user) **
async function loadOrderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<p style="text-align:center;">Loading orders...</p>';

    if (!currentUser || !currentUser.user_id) {
        historyList.innerHTML = '<p style="text-align:center;">Please log in to see your orders.</p>';
        return;
    }
    
    // Supabase ကနေ order တွေကို user ID နဲ့ ဆွဲထုတ်မယ်
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.user_id) 
        .order('created_at', { ascending: false });

    if (error) {
        historyList.innerHTML = `<p style="text-align:center; color:red;">Error loading orders: ${error.message}</p>`;
        return;
    }

    if (orders.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;">You have no past orders.</p>';
        return;
    }

    historyList.innerHTML = '';
    orders.forEach(order => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div>
                <strong>Order ID: ${order.id}</strong><br>
                <span>${order.product_name} x ${order.quantity}</span><br>
                <small>Total: ${order.total_price} MMK</small>
            </div>
            <span style="font-weight:bold; color: ${order.status === 'Pending' ? '#ff9800' : '#4CAF50'};">${order.status}</span>
        `;
        historyList.appendChild(item);
    });
}

// ** sendOrder Function (Send order and store user ID) **
async function sendOrder() {
    // ... (Existing code for order details, image upload, telegram message) ...
    // ... (Retrieve product details) ...
    
    // New: User ID ကို order data ထဲ ထည့်သွင်းခြင်း
    const userId = localStorage.getItem('currentUserId') || 'guest';
    
    const orderData = {
        // ... (Other order fields) ...
        user_id: userId, // User ID ကို သိမ်းဆည်း
        // ...
    };
    
    // 1. Supabase ကို order data ထည့်မယ်
    const { error: dbError } = await supabase.from('orders').insert([orderData]);

    // ... (Rest of the sendOrder function remains the same, assuming it handles image upload and Telegram) ...
    
    // For this example, we assume success after data validation.
    // Replace with your actual success logic after Supabase insertion.
    showSnackbar('Order sent successfully to Admin!', 'success');
    closeModal('checkoutModal');
    openModal('successModal');
    
    // Clear the form
    document.getElementById('addressInput').value = '';
    document.getElementById('contactPhoneInput').value = '';
    document.getElementById('noteInput').value = '';
    document.getElementById('slipInput').value = '';
    document.getElementById('sendBtn').disabled = true;
}


// ... (The rest of the functions: toggleMenu, switchTab, loadProducts, renderProducts, showProductDetails, openCheckoutFromDetails, checkSlipFile, toggleChat, sendChatMessage, etc. remain the same) ...


// --- INITIALIZATION ---
window.onload = function() {
    loadSettings();
    loadProducts('all', 'All Products', 'women'); // Initial product load
    // Admin.html အတွက် code တွေက ဒီမှာ မလိုဘူး၊ admin.html မှာပဲ ထားမယ်
