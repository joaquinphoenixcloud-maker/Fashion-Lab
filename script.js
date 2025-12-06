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
        order_form: "Order Form", address_label: "Delivery Address (ပို့ဆောင်ရန်လိပ်စာ)", contact_label: "Contact Phone (ဆက်သွယ်ရန်ဖုန်း)", note_label: "Note (အကြောင်းအရာ)",
        slip_label: "Payment Slip (ပြေစာ)", send_btn: "Send to Admin", chat_title: "Support Chat", history_title: "My Orders",
        settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language", 
        // AUTH NEW KEYS
        login_tab: "Login", register_tab: "Register", name_label: "Name", id_label: "User ID (8-Digit)", phone_label: "Phone Number",
        login_btn: "Login", register_btn: "Register", logout_btn: "Logout", 
        register_success_id: "Registration successful. Your ID: ", invalid_login: "Invalid User ID or Phone Number.",
        // END AUTH NEW KEYS
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        search_placeholder: "Search...", chat_reply: "Hello! How can I help you today?", welcome_back: "Welcome back, " 
    },
    my: {
        shop_cat: "အမျိုးသမီးဖက်ရှင်", all: "ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", bag: "အိတ်",
        men_cat: "အမျိုးသားဖက်ရှင်", accessories: "အသုံးအဆောင်",
        order_form: "မှာယူမှုပုံစံ", address_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "အကြောင်းအရာ",
        slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်", chat_title: "အကူအညီချတ်", history_title: "မှာယူမှုမှတ်တမ်း",
        settings_title: "ဆက်တင်များ", dark_mode: "ညမုဒ်", language_title: "ဘာသာစကား", 
        // AUTH NEW KEYS
        login_tab: "ဝင်ရန်", register_tab: "အကောင့်ဖွင့်ရန်", name_label: "နာမည်", id_label: "User ID (ဂဏန်း ၈ လုံး)", phone_label: "ဖုန်းနံပါတ်",
        login_btn: "ဝင်မည်", register_btn: "ဖွင့်မည်", logout_btn: "ထွက်မည်", 
        register_success_id: "အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ သင့် ID: ", invalid_login: "User ID သို့မဟုတ် ဖုန်းနံပါတ် မှားယွင်းနေပါသည်။",
        // END AUTH NEW KEYS
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်! ", order_sent_p: "ငွေပေးချေမှုအောင်မြင်ပါပြီ၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "အိုကေ",
        search_placeholder: "ရှာဖွေပါ...", chat_reply: "မင်္ဂလာပါ... ဘာကူညီပေးရမလဲရှင့်?", welcome_back: "ပြန်လည်ကြိုဆိုပါသည်, " 
    },
    th: {
        shop_cat: "แฟชั่นสตรี", all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", bag: "กระเป๋า",
        men_cat: "แฟชั่นบุรุษ", accessories: "เครื่องประดับ",
        order_form: "แบบฟอร์มคำสั่งซื้อ", address_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์ติดต่อ", note_label: "หมายเหตุ",
        slip_label: "สลิปการชำระเงิน", send_btn: "ส่งถึงแอดมิน", chat_title: "แชทสนับสนุน", history_title: "คำสั่งซื้อของฉัน",
        settings_title: "การตั้งค่า", dark_mode: "โหมดกลางคืน", language_title: "ภาษา", 
        // AUTH NEW KEYS
        login_tab: "เข้าสู่ระบบ", register_tab: "ลงทะเบียน", name_label: "ชื่อ", id_label: "รหัสบัญชี (8 หลัก)", phone_label: "เบอร์โทรศัพท์",
        login_btn: "เข้าสู่ระบบ", register_btn: "ลงทะเบียน", logout_btn: "ออกจากระบบ",
        register_success_id: "ลงทะเบียนสำเร็จ รหัสของคุณคือ: ", invalid_login: "รหัสบัญชีหรือเบอร์โทรศัพท์ไม่ถูกต้อง",
        // END AUTH NEW KEYS
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะดำเนินการจัดส่งเร็วๆ นี้🎉", ok_btn: "ตกลง",
        search_placeholder: "ค้นหา...", chat_reply: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ?", welcome_back: "ยินดีต้อนรับกลับ, " 
    }
};

let currentLang = localStorage.getItem('kshop_lang') || 'en';

// --- FALLBACK SAMPLE PRODUCTS ---
const allSampleProducts = [
    {
        name: "Summer Floral Dress", price: 25000, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 
        category: "clothing", gender: "women", description: "Lightweight cotton floral dress perfect for summer outings.", 
        sizes: ["S", "M", "L", "XL"], 
        colors: [{ name: "Red", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }, { name: "Blue", image_url: "https://images.unsplash.com/photo-1594633312681-425c220f54b7?w=500" }]
    },
    {
        name: "Red Stiletto Heels", price: 45000, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500", 
        category: "shoes", gender: "women", description: "Elegant red heels for any formal occasion. Heel height: 4 inches.",
        sizes: ["36", "37", "38", "39"], colors: [{ name: "Red", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500" }]
    },
    {
        name: "Tote Shoulder Bag", price: 55000, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", 
        category: "bag", gender: "women", description: "Spacious tote bag for daily essentials.", sizes: ["One Size"], 
        colors: [{ name: "Brown", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" }] 
    }, 
    {
        name: "Denim Jacket", price: 75000, image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500", 
        category: "clothing", gender: "men", description: "Classic blue denim jacket, regular fit.", sizes: ["M", "L", "XL"], 
        colors: [{ name: "Blue", image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500" }]
    },
    {
        name: "Sports Watch", price: 95000, image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500", 
        category: "accessories", gender: "men", description: "Waterproof digital sports watch with stopwatch.", sizes: ["Adjustable"], 
        colors: [{ name: "Black", image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500" }]
    }
];

const sampleBanners = [
    {image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"},
    {image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"},
    {image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"}
];

// --- WINDOW ONLOAD ---
window.onload = async function() {
    const langSelect = document.getElementById('langSelect');
    const savedLang = localStorage.getItem('kshop_lang');
    if (savedLang && currentTranslations[savedLang]) {
        currentLang = savedLang;
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    } else if (langSelect.options.length > 0 && currentTranslations[currentLang]) {
        langSelect.value = currentLang;
        applyLanguage(currentLang);
    }
    
    await loadUserSession();
    
    // Check if we are on admin page or index page
    if (document.getElementById('adminContent')) {
        checkAdminAccess(); // Specific for admin.html
    } else {
        loadProducts('all', currentTranslations[currentLang].all, 'women'); 
        loadBanners(); 
    }
    
    updateUserUI();
    
    if(localStorage.getItem('kshop_dark_mode') === 'on') {
        document.body.classList.add('dark-mode');
        if(document.getElementById('darkModeToggle')) document.getElementById('darkModeToggle').checked = true;
    }
}

// ==========================================================
// *** NEW AUTH SYSTEM: 8-Digit ID + Phone ***
// ==========================================================

// 1. Load Session
async function loadUserSession() {
    const userID = localStorage.getItem('user_id'); 
    const username = localStorage.getItem('user_name'); 
    
    if (!userID) {
        currentUser = null;
        updateUserUI();
        return;
    }

    const { data: profile, error } = await supabase
        .from('users')
        .select(`*`)
        .eq('id', userID) 
        .single();
    
    if (error || !profile) {
        console.error('User Session Error:', error);
        localStorage.removeItem('user_id'); 
        localStorage.removeItem('user_name'); 
        currentUser = null;
    } else {
        currentUser = profile;
    }
    updateUserUI();
}

// 2. Auth Modal UI Switcher
function showAuthForm(type) {
    const lForm = document.getElementById('loginForm');
    const rForm = document.getElementById('registerForm');
    const lTab = document.getElementById('tabLogin');
    const rTab = document.getElementById('tabRegister');

    if (type === 'login') {
        lForm.style.display = 'block';
        rForm.style.display = 'none';
        lTab.style.borderBottom = '2px solid #2d2d2d';
        lTab.style.fontWeight = 'bold';
        lTab.style.color = '#333';
        rTab.style.borderBottom = 'none';
        rTab.style.fontWeight = 'normal';
        rTab.style.color = '#777';
    } else {
        lForm.style.display = 'none';
        rForm.style.display = 'block';
        rTab.style.borderBottom = '2px solid #2d2d2d';
        rTab.style.fontWeight = 'bold';
        rTab.style.color = '#333';
        lTab.style.borderBottom = 'none';
        lTab.style.fontWeight = 'normal';
        lTab.style.color = '#777';
    }
}

function checkAuth() { 
    if(currentUser) openHistory(); 
    else {
        document.getElementById('authModal').style.display = 'flex'; 
        document.getElementById('loginUserID').value = '';
        document.getElementById('loginPhone').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerPhone').value = '';
        showAuthForm('login');
    }
}

// 3. Helper: Generate Random 8-Digit ID
function generateRandom8DigitID() {
    // Range: 10000000 to 99999999
    return Math.floor(10000000 + Math.random() * 90000000);
}

// 4. REGISTER FUNCTION
async function doRegister() {
    const name = document.getElementById('registerName').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();

    if (name.length < 3 || phone.length < 5) {
        showSnackbar("Name and Phone are required.", 'error');
        return;
    }

    // Generate Unique 8-Digit ID with Collision Check
    let newID = generateRandom8DigitID();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        const { data } = await supabase.from('users').select('id').eq('id', newID).maybeSingle();
        if (!data) {
            isUnique = true; 
        } else {
            newID = generateRandom8DigitID(); 
            attempts++;
        }
    }

    if (!isUnique) {
        showSnackbar("Error generating ID. Please try again.", 'error');
        return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
        .from('users')
        .insert([{ 
            id: newID, 
            username: name, 
            phone: phone,
            is_admin: false 
        }])
        .select()
        .single();

    if (error) {
        console.error('Registration Error:', error);
        showSnackbar("Registration Failed: " + error.message, 'error');
        return;
    }

    // Success
    alert(`Registration Successful!\n\nIMPORTANT: Your User ID is: ${newID}\n\nPlease save this ID to login.`);
    
    // Auto Login
    localStorage.setItem('user_id', newID);
    localStorage.setItem('user_name', name);
    currentUser = data;
    updateUserUI();
    closeModal('authModal');
    showSnackbar("Logged in successfully!", 'success');
}

// 5. LOGIN FUNCTION
async function doLogin() {
    const inputID = document.getElementById('loginUserID').value.trim();
    const inputPhone = document.getElementById('loginPhone').value.trim();

    if (!inputID || !inputPhone) {
        showSnackbar("Please enter both User ID and Phone Number.", 'error');
        return;
    }

    // Check ID and Phone match in Supabase
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', parseInt(inputID))
        .eq('phone', inputPhone)
        .maybeSingle();

    if (error || !user) {
        showSnackbar(currentTranslations[currentLang].invalid_login, 'error');
        return;
    }

    // Login Success
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_name', user.username);
    
    currentUser = user;
    updateUserUI();
    closeModal('authModal');
    showSnackbar(currentTranslations[currentLang].welcome_back + user.username, 'success');

    // Admin Redirect
    if (user.is_admin) {
        window.location.href = 'admin.html';
    } else if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

// 6. LOGOUT FUNCTION
async function doLogout() { 
    localStorage.removeItem('user_id'); 
    localStorage.removeItem('user_name'); 
    currentUser = null;
    updateUserUI();
    showSnackbar("Logout successful.", 'info');
    
    // If on admin page, redirect to home
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
    closeModal('historyModal');
}

// --- LANGUAGE ---
function applyLanguage(lang) {
    const t = currentTranslations[lang];
    if (!t) return;
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) el.innerText = t[key];
    });
    const chatIn = document.querySelector('#chatInput');
    if(chatIn) chatIn.placeholder = (lang === 'my') ? "စာပို့ပါ..." : (lang === 'th' ? "พิมพ์ข้อความ..." : "Type message...");
    const searchIn = document.querySelector('#searchInput');
    if(searchIn) searchIn.placeholder = t.search_placeholder || "Search...";
    const pTitle = document.querySelector('#pageTitle');
    if(pTitle) pTitle.innerText = t.all; 
}

function toggleLanguage(lang) {
    if (currentTranslations[lang]) {
        currentLang = lang;
        localStorage.setItem('kshop_lang', lang);
        applyLanguage(lang);
    }
}

// --- BANNERS ---
let slideIndex = 0;
async function loadBanners() {
    if (!document.getElementById('sliderWrapper')) return; // Exit if no slider (e.g., admin page)
    
    const { data, error } = await supabase.from('banners').select('image_url').order('order_index', { ascending: true }); 
    let finalBanners = (!error && data && data.length > 0) ? data : sampleBanners;

    const wrapper = document.getElementById('sliderWrapper');
    const dotsContainer = document.getElementById('dotsContainer');
    wrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    finalBanners.forEach((b, index) => {
        wrapper.innerHTML += `<div class="slide"><img src="${b.image_url}" alt="Banner ${index + 1}"></div>`;
        const activeClass = index === 0 ? ' active' : '';
        dotsContainer.innerHTML += `<span class="dot${activeClass}" onclick="currentSlide(${index})"></span>`;
    });
    if(finalBanners.length > 0) startSlider();
}

function startSlider() {
    showSlides();
    setInterval(() => { slideIndex++; showSlides(); }, 3000); 
}
function showSlides() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return; 
    
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    
    document.getElementById('sliderWrapper').style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[slideIndex].classList.add('active');
}
function currentSlide(n) { slideIndex = n; showSlides(); }

function updateUserUI() {
    const dot = document.getElementById('userDot');
    if(dot) dot.style.display = currentUser ? 'block' : 'none';
}

// --- SETTINGS ---
function openSettings() { document.getElementById('settingsModal').style.display = 'flex'; }
function toggleTheme(cb) { 
    document.body.classList.toggle('dark-mode', cb.checked); 
    localStorage.setItem('kshop_dark_mode', cb.checked ? 'on' : 'off');
}

// --- CHAT ---
function toggleChat() {
    const box = document.getElementById('chatBox');
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
}
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const userMessage = input.value.trim();
    if (userMessage === "") return;
    const body = document.getElementById('chatBody');
    
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "background:var(--vibrant-blue); color:white; padding:8px; border-radius:5px; margin-bottom:10px; text-align:right; margin-left:auto; display:table;";
    userDiv.innerText = userMessage;
    body.appendChild(userDiv);
    input.value = '';

    const botReplyText = currentTranslations[currentLang].chat_reply || "Hello! How can I help you today?";
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.style.cssText = "background:var(--bg-color); color:var(--text-color); padding:8px; border-radius:5px; margin-bottom:10px; display:table; border:1px solid #ddd;";
        replyDiv.innerText = botReplyText;
        body.appendChild(replyDiv);
        body.scrollTop = body.scrollHeight;
    }, 1000); 
}

// --- SNACKBAR ---
function showSnackbar(message, type = 'default') {
    const x = document.getElementById("snackbar");
    if(!x) return;
    x.innerText = message;
    x.className = 'show'; 
    x.classList.remove('error', 'success');
    if (type === 'error') x.classList.add('error');
    else if (type === 'success') x.classList.add('success');

    setTimeout(function(){ 
        x.classList.remove('show'); 
        setTimeout(() => { x.className = ''; }, 500); 
    }, 3000);
}

// --- HISTORY ---
async function openHistory() {
    if(!currentUser) { return; }
    document.getElementById('historyModal').style.display='flex';
    const con = document.getElementById('historyList');
    con.innerHTML = '<p>Loading...</p>';
    
    const currentUserID = localStorage.getItem('user_id'); 
    if (!currentUserID) { con.innerHTML='<p>Please log in.</p>'; return; }

    let { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_user_id', currentUserID) 
        .order('created_at', {ascending:false});
    
    if(!data || !data.length) { con.innerHTML='<p>No orders yet.</p>'; return; }
    let html = '';
    data.forEach(o => {
        let icon = '⏳';
        if(o.status==='reject') icon='⛔'; if(o.status==='coming') icon='🟡'; if(o.status==='owned') icon='🟢';
        html += `<div class="history-item"><div><b>${o.item_name}</b><br>${o.price}</div><div style="font-size:20px;">${icon}</div></div>`;
    });
    con.innerHTML = html;
}

// --- PRODUCTS ---
async function loadProducts(cat, title, gender = 'women') { 
    const container = document.getElementById('productsContainer');
    if(!container) return; // Admin page protection

    container.innerHTML='';
    document.getElementById('sideMenu').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('loading').style.display = 'block'; 
    
    let q = supabase.from('products').select('*');
    if(gender) q = q.ilike('gender', gender);
    if(cat !== 'all') q = q.ilike('category', cat);
    
    let { data, error } = await q;

    document.getElementById('loading').style.display = 'none';

    if (!data || data.length === 0 || error) {
        data = allSampleProducts.filter(p => {
            const genderMatch = p.gender === gender;
            const categoryMatch = cat === 'all' || p.category === cat;
            return genderMatch && categoryMatch;
        });
    }
    currentProducts = data || [];
    renderProducts(currentProducts);
}

function renderProducts(list) {
    const con = document.getElementById('productsContainer');
    con.innerHTML = '';
    if (list.length === 0) { con.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No products found.</p>'; return; }
    
    list.forEach((p, index) => {
        let img = p.image_url || 'https://via.placeholder.com/300';
        let price = Number(p.price).toLocaleString();
        con.innerHTML += `
        <div class="product-card" onclick="openDetails(${index})">
            <img src="${img}" class="p-img">
            <div class="p-info"><div class="p-name">${p.name}</div><div class="p-price">${price} Ks</div></div>
            <div class="cart-btn" onclick="openDetails(${index})"><i class="fas fa-eye"></i></div>
        </div>`;
    });
}

function updateDetailsImage(colorIndexString) {
    if (!selectedProduct || !selectedProduct.colors || selectedProduct.colors.length === 0) return;
    const colorIndex = parseInt(colorIndexString);
    const p = selectedProduct;
    let imageUrl = p.image_url || 'https://via.placeholder.com/300'; 
    if (p.colors[colorIndex] && p.colors[colorIndex].image_url) {
        imageUrl = p.colors[colorIndex].image_url;
    }
    document.getElementById('detail-img').src = imageUrl;
    selectedProduct.current_image_url = imageUrl; 
}

function openDetails(idx) {
    if(!currentProducts || !currentProducts[idx]) return;
    const p = currentProducts[idx];
    selectedProduct = p; 
    
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = Number(p.price).toLocaleString() + " Ks";
    document.getElementById('detail-description').innerText = p.description || "No description available.";
    
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '';
    const sizes = p.sizes || ["One Size"]; 
    sizes.forEach(size => { sizeSelect.innerHTML += `<option value="${size}">${size}</option>`; });

    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '';
    const colors = p.colors && p.colors.length > 0 ? p.colors : [{ name: "N/A", image_url: p.image_url }]; 
    colors.forEach((color, index) => { colorSelect.innerHTML += `<option value="${index}">${color.name}</option>`; });
    colorSelect.setAttribute('onchange', 'updateDetailsImage(this.value)');
    
    document.getElementById('quantityInput').value = 1; 
    document.getElementById('detailsModal').style.display = 'flex';
    updateDetailsImage(0); 
}

// --- ORDER ---
function openCheckoutFromDetails() {
    if(!localStorage.getItem('user_id')) { 
        closeModal('detailsModal');
        checkAuth(); 
        return; 
    }
    if(!selectedProduct) return;
    
    const p = selectedProduct;
    const size = document.getElementById('sizeSelect').value;
    const colorIndex = document.getElementById('colorSelect').value; 
    const colorName = p.colors && p.colors[colorIndex] ? p.colors[colorIndex].name : 'N/A';
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

    const orderNote = `Size: ${size}, Color: ${colorName}, Qty: ${quantity}`;
    const totalPrice = Number(p.price) * quantity;

    document.getElementById('modal-name').innerText = `${p.name} (${orderNote})`;
    document.getElementById('modal-price').innerText = totalPrice.toLocaleString() + " Ks"; 
    document.getElementById('modal-img').src = p.current_image_url || p.image_url || '';
    document.getElementById('noteInput').value = orderNote; 
    document.getElementById('contactPhoneInput').value = currentUser ? currentUser.phone : ''; 
    document.getElementById('slipInput').value = '';
    document.getElementById('sendBtn').disabled = true;

    closeModal('detailsModal');
    document.getElementById('checkoutModal').style.display = 'flex';
}

function checkSlipFile() {
    const file = document.getElementById('slipInput').files[0];
    document.getElementById('sendBtn').disabled = !file;
}

async function sendOrder() {
    const btn = document.getElementById('sendBtn');
    const file = document.getElementById('slipInput').files[0];
    const address = document.getElementById('addressInput').value.trim();
    const contactPhone = document.getElementById('contactPhoneInput').value.trim();
    let note = document.getElementById('noteInput').value.trim(); 

    if (!address || !contactPhone || !file) {
        showSnackbar("Please fill in all required fields.", 'error'); 
        btn.disabled = false; return;
    }
    
    if(!currentUser) { showSnackbar("Please log in.", 'error'); return; }

    btn.innerText="Sending..."; btn.disabled=true;
    const pNameWithDetails = document.getElementById('modal-name').innerText;
    const pPrice = document.getElementById('modal-price').innerText;

    const { error: orderError } = await supabase.from('orders').insert([{
        customer_user_id: currentUser.id, 
        customer_name: currentUser.username, 
        customer_phone: contactPhone, 
        item_name: pNameWithDetails, price: pPrice, status: 'pending', address: address, note: note
    }]);

    if (orderError) {
        showSnackbar("Error: " + orderError.message, 'error'); 
        btn.innerText=currentTranslations[currentLang].send_btn; 
        btn.disabled=false;
        return;
    }

    const caption = `🛍️ *New Order*\n👤 ${currentUser.username} (ID: ${currentUser.id})\n📞 ${contactPhone}\n🏠 ${address}\n📝 ${note}\n---\n👗 ${pNameWithDetails}\n💰 ${pPrice}`;
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID); fd.append("caption", caption); fd.append("parse_mode", "Markdown");
    fd.append("photo", file); 
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {method:'POST', body:fd});
        closeModal('checkoutModal');
        document.getElementById('successModal').style.display = 'flex';
    } catch (error) { showSnackbar("Order sent to database but failed to notify Admin.", 'error'); }
    
    btn.innerText=currentTranslations[currentLang].send_btn; 
    btn.disabled = false;
    document.getElementById('slipInput').value = ''; 
    document.getElementById('sendBtn').disabled = true;
}

// --- UTILITY ---
function toggleMenu() { document.getElementById('sideMenu').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); }
function toggleSearch() { 
    const b=document.getElementById('searchBox'); 
    b.style.display=b.style.display==='block'?'none':'block'; 
    if(b.style.display === 'none') { document.getElementById('searchInput').value = ''; searchProducts(); }
}
function closeModal(id) { document.getElementById(id).style.display='none'; }
function searchProducts() { 
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productName = card.querySelector('.p-name').innerText.toLowerCase(); 
        if (productName.includes(searchTerm)) card.style.display = 'flex'; else card.style.display = 'none'; 
    });
}
function switchTab(t) { 
    document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
    document.querySelectorAll('.menu-section').forEach(e=>e.classList.remove('active'));
    if(t==='women'){ document.querySelectorAll('.tab')[0].classList.add('active'); document.getElementById('women-menu').classList.add('active'); }
    else { document.querySelectorAll('.tab')[1].classList.add('active'); document.getElementById('men-menu').classList.add('active'); }
} 

// --- ADMIN FUNCTIONS ---
async function checkAdminAccess() {
    await loadUserSession(); 
    if (currentUser && currentUser.is_admin === true) {
        document.getElementById('adminContent').style.display = 'block';
        loadOrdersForAdmin(); 
    } else {
        alert("Admin Access Denied.");
        window.location.href = 'index.html'; 
    }
}

async function loadOrdersForAdmin() {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const container = document.getElementById('ordersContainer');
    container.innerHTML = ''; 
    if (error) { container.innerHTML = '<p>Error loading orders.</p>'; return; }
    document.getElementById('orderCount').innerText = orders.length;

    if (orders.length === 0) { container.innerHTML = '<p style="text-align:center; color:#999;">No orders found yet.</p>'; return; }

    orders.forEach(order => {
        let statusClass = order.status ? order.status.toLowerCase().replace(/\s/g, '') : 'neworder'; 
        const orderHtml = `
            <div class="order-item">
                <h4>Order #${order.id || 'N/A'} - ${order.status || 'New Order'}</h4>
                <p><strong>Customer:</strong> ${order.customer_name || 'N/A'} (ID: ${order.customer_user_id || 'N/A'})</p>
                <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
                <p><strong>Price:</strong> ${order.price || 'N/A'}</p>
                <p><strong>Items:</strong> ${order.item_name || 'N/A'} (${order.note || 'N/A'})</p>
                <button class="order-status-btn ${statusClass}" onclick="updateOrderStatus(${order.id}, '${order.status || 'New Order'}')">Change Status</button>
            </div>`;
        container.insertAdjacentHTML('beforeend', orderHtml);
    });
}

async function updateOrderStatus(orderId, currentStatus) {
    let newStatus = '';
    if (currentStatus === 'New Order' || currentStatus === 'pending') newStatus = 'Processing';
    else if (currentStatus === 'Processing') newStatus = 'Shipped';
    else if (currentStatus === 'Shipped') newStatus = 'Delivered';
    else newStatus = 'New Order'; 

    const btn = event.currentTarget;
    btn.innerText = "Updating..."; btn.disabled = true;

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
        showSnackbar(`Order #${orderId} status updated to ${newStatus}`, 'success');
        loadOrdersForAdmin(); 
    }
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.remove('active'));
    document.querySelector(`.admin-tab[onclick*='${tabId}']`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'orders') loadOrdersForAdmin();
}
function logout() { doLogout(); }
async function addProduct(event) {
    event.preventDefault(); 
    showSnackbar("Product Management is a placeholder.", 'error');
}
