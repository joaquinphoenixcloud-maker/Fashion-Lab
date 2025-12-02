// admin-login.js
const messageElement = document.getElementById('message');
let adminPhoneNumber = ''; // OTP ပို့ရန်အတွက် ဖုန်းနံပါတ်ကို ဒီမှာ ခဏ သိမ်းထားပါမယ်

// Helper function for showing messages
function showMessage(text, isError = true) {
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.textContent = text;
}

// ----------------------------------------------------
// Step 1: Login with Email/Password and get user info
// ----------------------------------------------------
async function sendOtp() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showMessage('Please enter both email and password.');
        return;
    }
    
    // 1. Email/Password ဖြင့် Sign In ဝင်ပါ (Admin ဟုတ်/မဟုတ် Role ကို နောက်မှ စစ်ပါမယ်)
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (signInError) {
        showMessage('Login failed: Invalid credentials or account not found.');
        console.error('Sign In Error:', signInError);
        return;
    }
    
    // 2. User ရဲ့ Profile (Role) ကို စစ်ဆေးပါ
    const { data: profile, error: profileError } = await supabase
        .from('profiles') // **သင့်ရဲ့ User Profile Table ကို ပြောင်းပါ**
        .select('role, phone')
        .eq('id', user.id)
        .single();
    
    if (profileError || !profile || profile.role !== 'admin') {
        showMessage('Access Denied: This account is not an Admin account.');
        await supabase.auth.signOut(); // Admin မဟုတ်ရင် ချက်ချင်း ထွက်လိုက်ပါ
        return;
    }

    // 3. Admin ဟုတ်ပါက၊ 2FA (OTP) ပို့ရန်အတွက် ဖုန်းနံပါတ်ကို သိမ်းပါ
    adminPhoneNumber = profile.phone;
    if (!adminPhoneNumber) {
        showMessage('Admin account is missing a phone number. 2FA failed.', true);
        await supabase.auth.signOut();
        return;
    }

    // 4. Supabase Phone Auth ဖြင့် OTP ပို့ပါ
    // Note: Supabase က phone number ကို 'user@domain' format နဲ့ သိမ်းထားရင် ဖြုတ်ရပါမယ်
    const phoneToSend = adminPhoneNumber.replace(AUTH_DOMAIN, ''); 
    
    const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phoneToSend,
    });
    
    if (otpError) {
        showMessage('Failed to send OTP. Check Supabase logs.', true);
        console.error('OTP Send Error:', otpError);
        // OTP ပို့တာမအောင်မြင်ရင်လည်း Sign Out ပြန်လုပ်ဖို့ လိုပါတယ်
        await supabase.auth.signOut();
        return;
    }
    
    // 5. အောင်မြင်ပါက OTP Section ကို ပြပါ
    showMessage('OTP code sent successfully to your phone!', false);
    document.getElementById('password-section').style.display = 'none';
    document.getElementById('otp-section').style.display = 'block';
}

// ----------------------------------------------------
// Step 2: Verify OTP and Finalize Login
// ----------------------------------------------------
async function verifyOtp() {
    const otp = document.getElementById('otpCode').value;

    if (!adminPhoneNumber) {
        showMessage('Please login with email/password first to get OTP.');
        return;
    }

    if (!otp) {
        showMessage('Please enter the OTP code.');
        return;
    }

    // Supabase Phone Auth ဖြင့် OTP ကို စစ်ဆေးပါ
    const phoneToVerify = adminPhoneNumber.replace(AUTH_DOMAIN, '');

    const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneToVerify,
        token: otp,
        type: 'sms', // သို့မဟုတ် 'phone_change'
    });

    if (verifyError) {
        showMessage('OTP verification failed: Invalid or expired code.', true);
        console.error('OTP Verify Error:', verifyError);
        return;
    }

    // 3. 2FA အောင်မြင်ပါက Admin Panel သို့ ပို့ပါ
    showMessage('Login successful! Redirecting to Admin Panel...', false);
    window.location.href = 'admin.html';
}


