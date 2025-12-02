// CONFIG
// (Supabase URL/Key, BOT_TOKEN, CHAT_ID တို့ကို မပြောင်းလဲပါ)
const SUPABASE_URL = 'https://kfculpfelkfzigrptuae.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3VscGZlbGtmemlncnB0dWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MzMwMjEsImV4cCI6MjA4MDIwOTAyMX0.HwFdPcWYRAwcAvAxTHceEFNQtmxpq6h01gDgfoht4es'; 
const BOT_TOKEN = '8180483853:AAGU6BHy2Ws-PboyopehdBFkWY5kpedJn6Y'; 
const CHAT_ID = '-5098597126'; 

// **[ပြင်ဆင်ပြီး]**: Phone Auth Domain ကို ဖြုတ်လိုက်သည်။
// const AUTH_DOMAIN = '@kshop.com'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProducts = [];
let currentUser = null; 
let selectedProduct = null; 
// **[ပြင်ဆင်ပြီး]**: currentAuthPhone အစား currentAuthEmail
let currentAuthEmail = null; 
let currentLanguage = 'my';
let languages = {};
// ... (ကျန်တဲ့ code များ)

// ===============================================
// AUTHENTICATION FUNCTIONS
// ===============================================

// **[ပြင်ဆင်ပြီး]**: startAuth function ကို Email Auth အဖြစ် ပြောင်းလဲထားသည်
async function startAuth() {
    const email = document.getElementById('emailInput').value.trim(); // emailInput မှ တန်ဖိုးယူသည်
    
    if (!email) {
        showSnackbar(getLocalizedText('email_required'), 'error'); 
        return;
    }

    currentAuthEmail = email; // Email ကို သိမ်းဆည်း
    
    // Email ကို OTP/Magic Link ပို့ရန်
    const { data, error } = await supabase.auth.signInWithOtp({ email: currentAuthEmail }); 
    
    if (error) {
        showSnackbar(getLocalizedText('auth_fail') + ': ' + error.message, 'error');
        console.error(error);
    } else {
        // UI ကို OTP Form သို့ ပြောင်း
        document.getElementById('authForm').style.display = 'none';
        document.getElementById('otpForm').style.display = 'block';
        showSnackbar(getLocalizedText('otp_sent_to_email'), 'success');
    }
}

// **[ပြင်ဆင်ပြီး]**: verifyOtp function ကို Email Auth အဖြစ် ပြောင်းလဲထားသည်
async function verifyOtp(type) {
    const otp = document.getElementById('otpInput').value.trim();
    if (!otp) return;

    // Email နဲ့ code ကို သုံးပြီး OTP စစ်ဆေးသည်
    const { data: userData, error } = await supabase.auth.verifyOtp({ 
        email: currentAuthEmail, 
        token: otp, // code ကို token အနေဖြင့် ပို့သည်
        type: 'email' // type ကို email အဖြစ် သတ်မှတ်
    });

    if (error) {
        showSnackbar(getLocalizedText('otp_invalid'), 'error');
        console.error(error);
        return;
    }
    
    // ... (ကျန်သော Logic များ)
    const user = userData.user;
    const userId = user.id;
    const userEmail = user.email; // Email ကို ရယူ

    if (type === 'register') {
        // ... (Registration Logic)
        const name = document.getElementById('registerName').value.trim();
        // **[ဖုန်းနံပါတ်ဖြုတ်ပြီး]**: ဖုန်းနံပါတ်ကို မလိုအပ်တော့ပါ
        // const phone = document.getElementById('registerPhone').value.trim(); 
        
        if (!name) {
             showSnackbar(getLocalizedText('name_required'), 'error');
             return;
        }

        const { error: insertError } = await supabase
            .from('users')
            .insert([
                // NOTE: phone column ကို Supabase Table ထဲကနေ ဖျက်ပြီးသားဆိုရင် ဒီနေရာကိုလည်း ဖျက်ရပါမယ်။
                { id: userId, email: userEmail, name: name } 
            ]);

        // ... (Error handling)
        // ...
    }
    // ...
}

// ... (ကျန်သော Functions များ)

// **[ပြင်ဆင်ပြီး]**: Logout function ကို index.html သို့ ပြောင်းလဲ
function logout() {
    doLogout(); 
    window.location.href = 'index.html'; 
}

// --- TRANSLATION MAP (EN, MY, TH) ---
const currentTranslations = {
    en: {
        shop_cat: "WOMEN'S FASHION", all: "All Products", clothing: "Clothing", shoes: "Shoes", bag: "Bags",
        men_cat: "MEN'S FASHION", accessories: "Accessories",
        order_form: "Order Form", address_label: "Delivery Address (ပို့ဆောင်ရန်လိပ်စာ)", contact_label: "Contact Phone (ဆက်သွယ်ရန်ဖုန်း)", note_label: "Note (အကြောင်းအရာ)",
        slip_label: "Payment Slip (ပြေစာ)", send_btn: "Send to Admin", chat_title: "Support Chat", history_title: "My Orders",
        settings_title: "Settings", dark_mode: "Dark Mode", language_title: "Language", login_tab: "Login", register_tab: "Register", phone_label: "Phone", pass_label: "OTP Code", login_btn: "Send OTP Code", register_btn: "Send OTP Code", logout_btn: "Logout", name_label: "Name",
        order_sent_h3: "👾 Order sent!", order_sent_p: "Payment successful, delivery will be made soon.🎉", ok_btn: "OK",
        search_placeholder: "Search...", chat_reply: "Hello! How can I help you today?" 
    },
    my: {
        shop_cat: "အမျိုးသမီးဖက်ရှင်", all: "ပစ္စည်းအားလုံး", clothing: "အဝတ်အထည်", shoes: "ဖိနပ်", bag: "အိတ်",
        men_cat: "အမျိုးသားဖက်ရှင်", accessories: "အသုံးအဆောင်",
        order_form: "မှာယူမှုပုံစံ", address_label: "ပို့ဆောင်ရန်လိပ်စာ", contact_label: "ဆက်သွယ်ရန်ဖုန်း", note_label: "အကြောင်းအရာ",
        slip_label: "ငွေလွှဲပြေစာ", send_btn: "Admin ထံသို့ ပို့မည်", chat_title: "အကူအညီချတ်", history_title: "မှာယူမှုမှတ်တမ်း",
        settings_title: "ဆက်တင်များ", dark_mode: "ညမုဒ်", language_title: "ဘာသာစကား", login_tab: "ဝင်ရန်", register_tab: "အကောင့်ဖွင့်ရန်", phone_label: "ဖုန်းနံပါတ်", pass_label: "OTP ကုဒ်", login_btn: "OTP ကုဒ်ပို့မည်", register_btn: "OTP ကုဒ်ပို့မည်", logout_btn: "ထွက်မည်", name_label: "နာမည်",
        order_sent_h3: "👾 မှာယူမှု အောင်မြင်! ", order_sent_p: "ငွေပေးချေမှုအောင်မြင်ပါပြီ၊ မကြာမီ ပို့ဆောင်ပေးပါမည်။🎉", ok_btn: "အိုကေ",
        search_placeholder: "ရှာဖွေပါ...", chat_reply: "မင်္ဂလာပါ... ဘာကူညီပေးရမလဲရှင့်?" 
    },
    th: {
        shop_cat: "แฟชั่นสตรี", all: "สินค้าทั้งหมด", clothing: "เสื้อผ้า", shoes: "รองเท้า", bag: "กระเป๋า",
        men_cat: "แฟชั่นบุรุษ", accessories: "เครื่องประดับ",
        order_form: "แบบฟอร์มคำสั่งซื้อ", address_label: "ที่อยู่จัดส่ง", contact_label: "เบอร์ติดต่อ", note_label: "หมายเหตุ",
        slip_label: "สลิปการชำระเงิน", send_btn: "ส่งถึงแอดมิน", chat_title: "แชทสนับสนุน", history_title: "คำสั่งซื้อของฉัน",
        settings_title: "การตั้งค่า", dark_mode: "โหมดกลางคืน", language_title: "ภาษา", login_tab: "เข้าสู่ระบบ", register_tab: "ลงทะเบียน", phone_label: "เบอร์โทรศัพท์", pass_label: "รหัส OTP", login_btn: "ส่งรหัส OTP", register_btn: "ส่งรหัส OTP", logout_btn: "ออกจากระบบ", name_label: "ชื่อ",
        order_sent_h3: "👾 ส่งคำสั่งซื้อแล้ว!", order_sent_p: "ชำระเงินสำเร็จแล้ว จะดำเนินการจัดส่งเร็วๆ นี้🎉", ok_btn: "ตกลง",
        search_placeholder: "ค้นหา...", chat_reply: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ?" 
    }
};

let currentLang = localStorage.getItem('kshop_lang') || 'en';

// --- FALLBACK SAMPLE PRODUCTS (MODIFIED for image switching) ---
const allSampleProducts = [
    // Sample 1: Summer Floral Dress (Has multiple colors/images)
    {
        name: "Summer Floral Dress", 
        price: 25000, 
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", // Default image
        category: "clothing", 
        gender: "women", 
        description: "Lightweight cotton floral dress perfect for summer outings.", 
        sizes: ["S", "M", "L", "XL"], 
        colors: [
            { name: "Red", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }, 
            { name: "Blue", image_url: "https://images.unsplash.com/photo-1594633312681-425c220f54b7?w=500" }, 
            { name: "Yellow", image_url: "https://images.unsplash.com/photo-1574519525492-23c28a8d119e?w=500" } 
        ]
    },
    // Sample 2: Red Stiletto Heels 
    {
        name: "Red Stiletto Heels", 
        price: 45000, 
        image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500", 
        category: "shoes", 
        gender: "women", 
        description: "Elegant red heels for any formal occasion. Heel height: 4 inches.",
        sizes: ["36", "37", "38", "39"], 
        colors: [
            { name: "Red", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500" },
            { name: "Black", image_url: "https://images.unsplash.com/photo-1563297007-0bf0299ac7b5?w=500" }
        ]
    },
    // Sample 3: Tote Shoulder Bag
    {
        name: "Tote Shoulder Bag", 
        price: 55000, 
        image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", 
        category: "bag", 
        gender: "women",
        description: "Spacious tote bag for daily essentials.", 
        sizes: ["One Size"], 
        colors: [ 
            { name: "Brown", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" },
            { name: "Beige", image_url: "https://images.unsplash.com/photo-1534005199650-ef8a15e12812?w=500" },
            { name: "Black", image_url: "https://images.unsplash.com/photo-1585800588663-b8a2e20b5e28?w=500" }
        ] 
    }, 
    {
        name: "Denim Jacket", 
        price: 75000, 
        image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500", 
        category: "clothing", 
        gender: "men", 
        description: "Classic blue denim jacket, regular fit.", 
        sizes: ["M", "L", "XL"], 
        colors: [{ name: "Blue", image_url: "https://images.unsplash.com/photo-1565406080356-83606f71d532?w=500" }]
    },
    {
        name: "Sports Watch", 
        price: 95000, 
        image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500", 
        category: "accessories", 
        gender: "men", 
        description: "Waterproof digital sports watch with stopwatch.", 
        sizes: ["Adjustable"], 
        colors: [
            { name: "Black", image_url: "https://images.unsplash.com/photo-1620247472016-b83072225a07?w=500" },
            { name: "Silver", image_url: "https://images.unsplash.com/photo-1523275335684-c464a972620e?w=500" }
        ]
    }
];

// --- FALLBACK SAMPLE BANNERS ---
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
    
    // Check for existing Supabase session and load profile
    await loadUserSession();
    
    loadProducts('all', currentTranslations[currentLang].all, 'women'); 
    updateUserUI();
    loadBanners(); 
    
    if(localStorage.getItem('kshop_dark_mode') === 'on') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

// --- AUTH: Session/Profile Loading ---
async function loadUserSession() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
    }
    if (session) {
        const userId = session.user.id;
        // Fetch user profile from the custom 'users' table using the Supabase Auth UID
        let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        if (profileError) {
            console.error("Error fetching profile:", profileError);
            // Could be a user who signed up but profile creation failed. Sign them out for cleanup.
            await supabase.auth.signOut();
            return;
        }
        currentUser = profile;
    }
}


// --- LANGUAGE ---
function applyLanguage(lang) {
    const t = currentTranslations[lang];
    if (!t) return;
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) el.innerText = t[key];
    });
    document.querySelector('#chatInput').placeholder = (lang === 'my') ? "စာပို့ပါ..." : (lang === 'th' ? "พิมพ์ข้อความ..." : "Type message...");
    document.querySelector('#searchInput').placeholder = t.search_placeholder || "Search...";
    document.querySelector('#pageTitle').innerText = t.all; 
    
    // Update OTP button text after language change
     document.getElementById('sendOtpBtn').innerText = t.login_btn;
     document.getElementById('sendOtpRegisterBtn').innerText = t.register_btn;
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
    const { data, error } = await supabase
        .from('banners')
        .select('image_url')
        .order('order_index', { ascending: true }); 

    let finalBanners = [];
    if (!error && data && data.length > 0) {
        finalBanners = data;
    } else {
        console.log("Using Sample Banners (Supabase empty or error)");
        finalBanners = sampleBanners;
    }

    const wrapper = document.getElementById('sliderWrapper');
    const dotsContainer = document.getElementById('dotsContainer');
    wrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    finalBanners.forEach((b, index) => {
        wrapper.innerHTML += `<div class="slide"><img src="${b.image_url}" alt="Banner ${index + 1}"></div>`;
        const activeClass = index === 0 ? ' active' : '';
        dotsContainer.innerHTML += `<span class="dot${activeClass}" onclick="currentSlide(${index})"></span>`;
    });
    
    if(finalBanners.length > 0) {
         startSlider();
    }
}

function startSlider() {
    showSlides();
    setInterval(() => {
        slideIndex++;
        showSlides();
    }, 3000); 
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
    // Check for currentUser object loaded from the custom 'users' table
    if(currentUser) document.getElementById('userDot').style.display = 'block';
    else document.getElementById('userDot').style.display = 'none';
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

// --- SNACKBAR/TOAST FUNCTION ---
function showSnackbar(message, type = 'default') {
    const x = document.getElementById("snackbar");
    x.innerText = message;
    
    x.className = 'show'; // Start with show class
    
    // Apply color based on type
    x.classList.remove('error', 'success');
    if (type === 'error') {
        x.classList.add('error');
    } else if (type === 'success') {
        x.classList.add('success');
    }

    // After 3 seconds, hide the snackbar and reset class
    setTimeout(function(){ 
        x.classList.remove('show'); 
        // Delay removing color class until animation is mostly done
        setTimeout(() => { x.className = ''; }, 500); 
    }, 3000);
}

// --- AUTH & HISTORY (OTP MODIFIED) ---
function checkAuth() { 
    if(currentUser) openHistory(); 
    else {
        document.getElementById('authModal').style.display = 'flex'; 
        // Reset to default login view on open
        showAuthForm('login'); 
        // Clear any previous OTP steps
        document.getElementById('lPhone').value = '';
        document.getElementById('verifyOtpLogin').style.display = 'none';
        document.getElementById('sendOtpBtn').style.display = 'block';

        document.getElementById('rName').value = '';
        document.getElementById('rPhone').value = '';
        document.getElementById('verifyOtpRegister').style.display = 'none';
        document.getElementById('sendOtpRegisterBtn').style.display = 'block';
        currentAuthPhone = null;
    }
}

function showAuthForm(type) {
    // Reset to Step 1 when switching tabs
    currentAuthPhone = null;

    if(type === 'login') {
        document.getElementById('tabLogin').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabRegister').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.color = '#777';
        document.getElementById('tabLogin').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='block';
        document.getElementById('registerForm').style.display='none';
        
        // Show Step 1 for Login
        document.getElementById('verifyOtpLogin').style.display = 'none';
        document.getElementById('sendOtpBtn').style.display = 'block';
        document.getElementById('lPhone').value = ''; // Clear phone input on switch
    } else {
        document.getElementById('tabLogin').style.borderBottom = 'none';
        document.getElementById('tabRegister').style.borderBottom = '2px solid #2d2d2d';
        document.getElementById('tabLogin').style.color = '#777';
        document.getElementById('tabRegister').style.color = 'var(--text-color)';
        document.getElementById('loginForm').style.display='none';
        document.getElementById('registerForm').style.display='block';
        
        // Show Step 1 for Register
        document.getElementById('verifyOtpRegister').style.display = 'none';
        document.getElementById('sendOtpRegisterBtn').style.display = 'block';
        document.getElementById('rName').value = ''; // Clear name input on switch
        document.getElementById('rPhone').value = ''; // Clear phone input on switch
    }
}

// --- OTP Step 1: Send OTP to Phone ---
async function sendOtp(type) {
    let phone, btn;
    
    if (type === 'login') {
        phone = document.getElementById('lPhone').value.trim();
        btn = document.getElementById('sendOtpBtn');
    } else { // register
        const name = document.getElementById('rName').value.trim();
        if (!name) {
            showSnackbar("Please enter your name for registration.", 'error');
            return;
        }
        phone = document.getElementById('rPhone').value.trim();
        btn = document.getElementById('sendOtpRegisterBtn');
    }

    if (!phone) {
        showSnackbar("Please enter your phone number.", 'error');
        return;
    }
    
    const cleanedPhone = phone.replace(/\D/g, ''); 
    
    if (cleanedPhone.length < 6) { // Basic check
         showSnackbar("Invalid phone number format.", 'error');
         return;
    }
    
    currentAuthPhone = cleanedPhone; // Store the phone number
    
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    // Use Supabase signInWithOtp with the 'phone' option
    const { error: otpError } = await supabase.auth.signInWithOtp({ 
        phone: cleanedPhone 
    });

    if (otpError) {
        showSnackbar("Error sending OTP: " + otpError.message, 'error');
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }
    
    showSnackbar(`OTP code sent to ${cleanedPhone}.`, 'success');

    if (type === 'login') {
        document.getElementById('sendOtpBtn').style.display = 'none';
        document.getElementById('verifyOtpLogin').style.display = 'block';
    } else { // register
        document.getElementById('sendOtpRegisterBtn').style.display = 'none';
        document.getElementById('verifyOtpRegister').style.display = 'block';
    }

    btn.innerText = originalText;
    btn.disabled = false; // Re-enable in case they want to retry sending
}

// --- OTP Step 2: Verify OTP and Login/Register ---
async function verifyOtp(type) {
    let otp, btn, name = null;
    
    if (!currentAuthPhone) {
         showSnackbar("Please send OTP first.", 'error');
         return;
    }

    if (type === 'login') {
        otp = document.getElementById('lOtp').value.trim();
        btn = document.getElementById('verifyOtpLogin').querySelector('button');
    } else { // register
        otp = document.getElementById('rOtp').value.trim();
        btn = document.getElementById('verifyOtpRegister').querySelector('button');
        name = document.getElementById('rName').value.trim(); // Get name for registration
    }

    if (!otp) {
        showSnackbar("Please enter the OTP code.", 'error');
        return;
    }
    
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    btn.disabled = true;

    // Use Supabase verifyOtp
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone: currentAuthPhone,
        token: otp,
        type: 'sms'
    });

    if (authError) {
        showSnackbar("OTP verification failed: " + authError.message, 'error');
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    const userId = authData.user.id;

    if (type === 'register') {
         // ** Registration flow **
        if (!name) { 
            showSnackbar("Name is missing. Please try registering again.", 'error');
            await supabase.auth.signOut(); // Force sign out if registered without name
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }
        
        // 2. Insert user profile into the custom 'users' table
        let { error: profileError } = await supabase.from('users').insert([
            { user_id: userId, name: name, phone: currentAuthPhone }
        ]);
    
        if (profileError) {
            showSnackbar("Profile saving failed. Please contact support.", 'error');
            // The user is authenticated but profile is missing. We let them proceed but warn.
            // In a real app, you might force sign out here or redirect to a profile completion page.
        }

        showSnackbar("Registration & Login successful!", 'success');
    }
    
    // ** Login/Post-Registration Flow **
    
    // 3. Fetch User Profile from custom table
    let { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (profileError || !profileData) {
        // If profile is missing for a logged-in user, they might be new or profile creation failed.
        // In this OTP flow, if they registered, profile should exist. 
        // If they logged in, we must assume they are registered.
         showSnackbar("Profile not found. Please contact support.", 'error');
         // Don't sign out, as they are authenticated, but warn.
    }
    
    currentUser = profileData;
    closeModal('authModal'); 
    updateUserUI(); 
    openHistory();
    if (type === 'login') showSnackbar("Login successful!", 'success'); 
    
    btn.innerText = originalText;
    btn.disabled = false;
}

async function doLogout() { 
    await supabase.auth.signOut(); // Securely sign out
    currentUser = null; 
    closeModal('historyModal'); 
    updateUserUI(); 
    showSnackbar("Logged out successfully.", 'success');
}

async function openHistory() {
    if(!currentUser) { return; }
    document.getElementById('historyModal').style.display='flex';
    const con = document.getElementById('historyList');
    con.innerHTML = '<p>Loading...</p>';
    
    // Fetch history using the secured customer_user_id (Supabase UID)
    let { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_user_id', currentUser.user_id) 
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
    document.getElementById('productsContainer').innerHTML='';
    document.getElementById('sideMenu').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('loading').style.display = 'block'; 
    
    let q = supabase.from('products').select('*');
    
    if(gender) {
        q = q.ilike('gender', gender);
    }
    if(cat !== 'all') { 
        q = q.ilike('category', cat);
    }
    
    let { data, error } = await q;

    document.getElementById('loading').style.display = 'none';

    if (!data || data.length === 0 || error) {
        console.log(`Using Sample Data or Fallback for ${gender} - ${cat}`);
        data = allSampleProducts.filter(p => {
            const genderMatch = p.gender === gender;
            const categoryMatch = cat === 'all' || p.category === cat;
            return genderMatch && categoryMatch;
        });
    }

    currentProducts = data || [];
    
    if (currentProducts.length === 0) {
         document.getElementById('productsContainer').innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No products found.</p>';
    } else {
         renderProducts(currentProducts, title);
    }
}

function renderProducts(list, title) {
    const con = document.getElementById('productsContainer');
    con.innerHTML = '';
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

// --- PRODUCT DETAILS & IMAGE UPDATE FUNCTIONS ---
function updateDetailsImage(colorIndexString) {
    if (!selectedProduct || !selectedProduct.colors || selectedProduct.colors.length === 0) return;

    const colorIndex = parseInt(colorIndexString);
    const p = selectedProduct;
    
    let imageUrl = p.image_url || 'https://via.placeholder.com/300'; 
    if (p.colors[colorIndex] && p.colors[colorIndex].image_url) {
        imageUrl = p.colors[colorIndex].image_url;
    }
    
    document.getElementById('detail-img').src = imageUrl;
    // Store the selected image URL for the checkout modal
    selectedProduct.current_image_url = imageUrl; 
}

function openDetails(idx) {
    if(!currentProducts || !currentProducts[idx]) return;
    const p = currentProducts[idx];
    selectedProduct = p; // Store the selected product globally
    
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = Number(p.price).toLocaleString() + " Ks";
    document.getElementById('detail-description').innerText = p.description || "No description available.";
    
    // Populate Size Options
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '';
    const sizes = p.sizes || ["One Size"]; 
    sizes.forEach(size => {
        sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
    });

    // Populate Color Options (Key part for image switching)
    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '';
    // Handle product having a proper colors array or defaulting to N/A
    const colors = p.colors && p.colors.length > 0 ? p.colors : [{ name: "N/A", image_url: p.image_url || 'https://via.placeholder.com/300' }]; 

    colors.forEach((color, index) => {
        // Use index as the value to link to the colors array
        colorSelect.innerHTML += `<option value="${index}">${color.name}</option>`; 
    });

    // Set the onchange handler (This is what triggers the image change)
    colorSelect.setAttribute('onchange', 'updateDetailsImage(this.value)');
    document.getElementById('quantityInput').value = 1; // Reset quantity

    document.getElementById('detailsModal').style.display = 'flex';
    // Load the first color's image by default, or the default image
    updateDetailsImage(0); 
}


// --- CART & ORDER (MODIFIED) ---
function openCheckoutFromDetails() {
    if(!currentUser) { 
        closeModal('detailsModal');
        checkAuth(); 
        return; 
    }
    if(!selectedProduct) return;
    
    const p = selectedProduct;
    const size = document.getElementById('sizeSelect').value;
    const colorIndex = document.getElementById('colorSelect').value; // Get the index value
    
    // Safely get the color name using the index
    const colorName = p.colors && p.colors[colorIndex] ? p.colors[colorIndex].name : 'N/A';
    
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

    if (quantity < 1) { 
        showSnackbar("Quantity must be at least 1.", 'error'); 
        return; 
    }

    const orderNote = `Size: ${size}, Color: ${colorName}, Qty: ${quantity}`;
    const totalPrice = Number(p.price) * quantity;

    // Set data for the Checkout Modal
    document.getElementById('modal-name').innerText = `${p.name} (${orderNote})`;
    document.getElementById('modal-price').innerText = totalPrice.toLocaleString() + " Ks"; 
    
    // Use the currently selected image URL (stored by updateDetailsImage)
    document.getElementById('modal-img').src = p.current_image_url || p.image_url || '';
    
    // Set the consolidated note and contact phone
    document.getElementById('noteInput').value = orderNote; 
    document.getElementById('contactPhoneInput').value = currentUser.phone || ''; 
    
    // Reset slip input and button state for a fresh order
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
        showSnackbar("Please fill in all required fields (Address, Phone, Slip).", 'error'); 
        btn.disabled = false; return;
    }
    
    if(!currentUser || !currentUser.user_id) {
        showSnackbar("User is not logged in properly. Please re-login.", 'error'); 
        return;
    }

    btn.innerText="Sending..."; btn.disabled=true;
    const pNameWithDetails = document.getElementById('modal-name').innerText;
    const pPrice = document.getElementById('modal-price').innerText;

    // Save order with the secured user_id
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        customer_name: currentUser.name, customer_phone: contactPhone, customer_user_id: currentUser.user_id,
        item_name: pNameWithDetails, price: pPrice, status: 'pending', address: address, note: note
    }]);

    if (orderError) {
        showSnackbar("Database Error: Could not save order. " + orderError.message, 'error'); 
        btn.innerText=currentTranslations[currentLang].send_btn; 
        btn.disabled=false;
        return;
    }

    const caption = `🛍️ *New Order*\n👤 ${currentUser.name}\n📞 ${contactPhone}\n🏠 ${address}\n📝 ${note}\n---\n👗 ${pNameWithDetails}\n💰 ${pPrice}`;
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID); fd.append("caption", caption); fd.append("parse_mode", "Markdown");
    fd.append("photo", file); 
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {method:'POST', body:fd});
        closeModal('checkoutModal');
        document.getElementById('successModal').style.display = 'flex';
    } catch (error) {
         showSnackbar("Order sent to database but failed to notify Admin.", 'error'); 
    }
    
    btn.innerText=currentTranslations[currentLang].send_btn; 
    btn.disabled = false;
    document.getElementById('slipInput').value = ''; 
    document.getElementById('sendBtn').disabled = true;
}

// --- UI UTILITY ---
function toggleMenu() { document.getElementById('sideMenu').classList.toggle('active'); document.querySelector('.overlay').classList.toggle('active'); }
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
    }
    else { 
        document.querySelectorAll('.tab')[1].classList.add('active'); 
        document.getElementById('men-menu').classList.add('active'); 
    }
} // <--- switchTab function ရဲ့ ပိတ်ကွင်း (အဆုံးသတ်)

// --- ADMIN FUNCTIONS ---
// ဤ block တစ်ခုလုံးသည် switchTab function ၏ အပြင်ဘက် (global scope) တွင် ရှိရမည်။

// 1. Admin Access Check
// NOTE: This assumes you have an 'is_admin' column (boolean) in your 'users' table 
// in Supabase to mark admin users.
async function checkAdminAccess() {
    // Session ကို အရင်စစ်မယ်
    await loadUserSession(); // This function (Line 144) populates currentUser

    // currentUser ရဲ့ 'is_admin' ကို စစ်မယ်
    // Profile မရှိသေးရင်လည်း access ငြင်းပါမယ်
    if (currentUser && currentUser.is_admin === true) {
        document.getElementById('adminContent').style.display = 'block';
        loadOrdersForAdmin(); // Admin ဖြစ်ရင် Order တွေ စတင် load မယ်
    } else {
        // Admin မဟုတ်ရင် (သို့) Login မလုပ်ရသေးရင် Home page ကို ပြန်ပို့မယ်
        alert("Admin Access Denied. Redirecting to home.");
        window.location.href = 'indexOOO.html'; 
    }
}

// 2. Load Orders for Admin
async function loadOrdersForAdmin() {
    // အမှာစာအားလုံးကို created_at အသစ်ဆုံးကနေ အရင်ဆွဲထုတ်မယ်
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    const container = document.getElementById('ordersContainer');
    container.innerHTML = ''; // ရှိပြီးသား content ကို ဖျက်မယ်

    if (error) {
        showSnackbar(`Error loading orders: ${error.message}`, 'error');
        container.innerHTML = '<p>Error loading orders.</p>';
        return;
    }

    document.getElementById('orderCount').innerText = orders.length;

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">No orders found yet.</p>';
        return;
    }

    orders.forEach(order => {
        // Status အရောင်ပြောင်းဖို့အတွက်
        let statusClass = order.status ? order.status.toLowerCase().replace(/\s/g, '') : 'neworder'; 

        const orderHtml = `
            <div class="order-item">
                <h4>Order #${order.id || 'N/A'} - ${order.status || 'New Order'}</h4>
                <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
                <p><strong>Price:</strong> ${order.price || 'N/A'}</p>
                <p><strong>Items:</strong> ${order.item_name || 'N/A'} (${order.note || 'N/A'})</p>
                <button class="order-status-btn ${statusClass}" 
                        onclick="updateOrderStatus(${order.id}, '${order.status || 'New Order'}')">
                    Change Status
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', orderHtml);
    });
}

// 3. Update Order Status (Basic implementation)
async function updateOrderStatus(orderId, currentStatus) {
    let newStatus = '';
    // Status တွေကို တစ်ဆင့်ပြီး တစ်ဆင့် ပြောင်းဖို့ logic
    if (currentStatus === 'New Order' || currentStatus === 'pending') newStatus = 'Processing';
    else if (currentStatus === 'Processing') newStatus = 'Shipped';
    else if (currentStatus === 'Shipped') newStatus = 'Delivered';
    else newStatus = 'New Order'; // ပြန်လည်စတင်

    const btn = event.currentTarget;
    btn.innerText = "Updating...";
    btn.disabled = true;

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        showSnackbar(`Failed to update status: ${error.message}`, 'error');
    } else {
        showSnackbar(`Order #${orderId} status updated to ${newStatus}`, 'success');
        loadOrdersForAdmin(); // UI ကို refresh လုပ်မယ်
    }
}

// 4. Admin UI Tab Switching
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.remove('active'));

    document.querySelector(`.admin-tab[onclick*='${tabId}']`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    // Orders tab ကို နှိပ်ရင် Order တွေကို ပြန် load မယ်
    if (tabId === 'orders') {
        loadOrdersForAdmin();
    }
}

// 5. Logout for Admin Page (Reusing existing doLogout function)
function logout() {
    doLogout(); 
    // Logout လုပ်ပြီးရင် home page ကို ပြန်ပို့
    window.location.href = 'indexOOO.html'; 
}

// 6. Basic Product Add (Placeholder - For Admin to add products)
async function addProduct(event) {
    event.preventDefault(); // Form submission ကို တားမယ်

    // NOTE: Image upload ကို Client-side မှာ တိုက်ရိုက်လုပ်တာဟာ လုံခြုံရေးအရ မကောင်းပါဘူး။ 
    // Supabase Storage RLS ကို သေသေချာချာ သတ်မှတ်ဖို့ လိုအပ်ပါတယ်။
    
    showSnackbar("Product Management is a placeholder. Requires secure implementation (Image Upload & Data Validation).", 'error');

    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    
    if (!name || !price) {
        showSnackbar("Please fill in Product Name and Price.", 'error');
        return;
    }
    
    // Sample insertion
    /*
    const newProduct = {
        name: name,
        price: price,
        description: document.getElementById('pDesc').value,
        // ...
    };
    const { error } = await supabase.from('products').insert([newProduct]);
    if (!error) {
        showSnackbar("Product added successfully!", 'success');
        document.getElementById('productForm').reset();
        // loadProducts('all', 'All Products', 'women'); // Main page ကို refresh လုပ်ဖို့
    }
    */
}
