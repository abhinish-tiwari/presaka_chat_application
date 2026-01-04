# 📱 Enable SMS in 2 Minutes

## Quick Steps to Send Real OTP SMS

### 1️⃣ Sign Up for MSG91 (30 seconds)

**Go to:** https://msg91.com/signup

- Enter your email and create password
- Verify your email
- **You get FREE credits to test!**

---

### 2️⃣ Get Your Auth Key (30 seconds)

1. **Login:** https://control.msg91.com/
2. Click **profile icon** (top right) → **"API Keys"**
3. **Copy your Auth Key**

Example: `123456ABCDEFabcdef123456`

---

### 3️⃣ Update .env File (30 seconds)

Open `backend/.env` and change these 2 lines:

```env
SMS_ENABLED=true
SMS_API_KEY=paste-your-auth-key-here
```

**Example:**
```env
SMS_ENABLED=true
SMS_API_KEY=123456ABCDEFabcdef123456
```

**That's it!** You don't need to change anything else.

---

### 4️⃣ Restart Backend (30 seconds)

```bash
# Press Ctrl+C to stop the backend
# Then restart:
cd backend
npm run dev
```

---

### 5️⃣ Test It! (30 seconds)

1. Open http://localhost:5174
2. Enter your mobile: `+919876543210`
3. Click "Send OTP"
4. **Check your phone!** 📱

---

## ✅ Done!

You should receive the OTP on your mobile number.

---

## 🐛 Not Working?

### Check Backend Logs

Look for:
- ✅ `Sending OTP to 9876543210 via MSG91...`
- ✅ `OTP sent successfully to +919876543210 via MSG91`

### Common Issues:

**1. Invalid Auth Key**
- Make sure you copied it correctly from MSG91
- No spaces before/after

**2. Phone Number Format**
- Must be: `+919876543210`
- Must start with `+91`
- Must be 10 digits after +91

**3. No Credits**
- Check MSG91 dashboard for available credits
- Free accounts get test credits

**4. Still Logging to Console**
- Make sure `SMS_ENABLED=true` in `.env`
- Make sure you restarted the backend

---

## 💡 Fallback

If SMS fails, the app will **automatically log the OTP to console** so you can still test!

Check the backend terminal for:
```
📱 OTP for +919876543210: 123456 (fallback to console)
```

---

## 🔄 Switch Back to Console Only

When done testing, just change:

```env
SMS_ENABLED=false
```

And restart the backend.

---

## 📊 Monitor SMS

**MSG91 Dashboard:** https://control.msg91.com/

- View sent SMS
- Check delivery status
- See remaining credits

---

## 💰 Free Credits

- **Signup Bonus:** 100-200 SMS free
- **Cost:** ₹0.15-0.25 per SMS after free credits
- **Perfect for testing!**

---

## 🎯 Summary

**Just 2 things to do:**

1. ✅ Get MSG91 Auth Key
2. ✅ Update `backend/.env`:
   ```env
   SMS_ENABLED=true
   SMS_API_KEY=your-key-here
   ```

**Then restart backend and test!**

---

**Need the Auth Key?** https://control.msg91.com/ → Profile → API Keys

