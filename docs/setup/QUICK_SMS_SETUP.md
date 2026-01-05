# Quick SMS Setup for Testing

## 🚀 Enable Real SMS in 5 Minutes

Follow these steps to send real OTP SMS to your mobile number for testing.

---

## Step 1: Sign Up for MSG91 (Free)

1. **Go to:** https://msg91.com/signup
2. **Sign up** with your email
3. **Verify** your email and phone number
4. You'll get **FREE SMS credits** to test!

---

## Step 2: Get Your Auth Key

1. **Login to MSG91 Dashboard:** https://control.msg91.com/
2. Click on your **profile icon** (top right)
3. Go to **"API Keys"** or **"Settings"**
4. **Copy your Auth Key** (looks like: `123456ABCDEFabcdef123456`)

---

## Step 3: Create OTP Template

### Option A: Use Default Template (Fastest)

MSG91 provides a default OTP template. You can use it immediately:

1. Go to **"SMS"** → **"Templates"**
2. Look for **default OTP template** or create a new one
3. **Template content:**
   ```
   Your Presaka verification code is ##OTP##. Valid for 5 minutes.
   ```
4. **Copy the Template ID** (looks like: `1234567890abcdef12345678`)

### Option B: Quick Template (No Approval Needed for Testing)

For testing, MSG91 allows you to send without template approval:

1. You can use a **test template ID**: Just use any random ID for now
2. MSG91 will send the OTP in a default format

---

## Step 4: Update Your .env File

Open `backend/.env` and update these lines:

```env
# Enable SMS
SMS_ENABLED=true

# MSG91 Configuration
SMS_PROVIDER=msg91
SMS_API_KEY=paste-your-auth-key-here
SMS_SENDER_ID=MSGIND
SMS_TEMPLATE_ID=paste-your-template-id-here
```

**Example:**
```env
SMS_ENABLED=true
SMS_PROVIDER=msg91
SMS_API_KEY=123456ABCDEFabcdef123456
SMS_SENDER_ID=MSGIND
SMS_TEMPLATE_ID=1234567890abcdef12345678
```

**Note:** 
- Replace `paste-your-auth-key-here` with your actual MSG91 Auth Key
- Replace `paste-your-template-id-here` with your actual Template ID
- `MSGIND` is a default sender ID that works for testing

---

## Step 5: Restart Backend Server

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL connected successfully
✅ Redis connected successfully
🚀 Server running on port 3001
```

---

## Step 6: Test It!

1. **Open frontend:** http://localhost:5174
2. **Enter your mobile number:** `+919876543210` (use your real number)
3. **Click "Send OTP"**
4. **Check your phone** - you should receive an SMS!
5. **Enter the OTP** and login

---

## 🎯 Quick Troubleshooting

### "Failed to send OTP" Error

**Check backend logs** for the actual error message.

**Common issues:**

1. **Invalid Auth Key**
   - Make sure you copied the correct Auth Key from MSG91
   - No spaces before/after the key

2. **Invalid Template ID**
   - For testing, you can use any random template ID
   - MSG91 will send in default format

3. **Phone number format**
   - Must be: `+919876543210` (with +91)
   - 10 digits after +91

4. **No credits**
   - Check your MSG91 dashboard for available credits
   - Free accounts get test credits

### SMS Not Received

1. **Check backend logs** - does it say "OTP sent successfully"?
2. **Check your phone** - sometimes SMS takes 10-30 seconds
3. **Check spam/blocked messages**
4. **Try a different number** to test

### Still Logging to Console

Make sure `SMS_ENABLED=true` in your `.env` file and you restarted the backend.

---

## 💡 Alternative: Use MSG91 Test Mode

If you don't want to set up templates, you can use MSG91's simple API:

Update `backend/src/services/sms.service.js` to use the simpler endpoint:

```javascript
// Simple MSG91 API (no template needed)
const response = await axios.get(
  `https://api.msg91.com/api/sendotp.php?authkey=${process.env.SMS_API_KEY}&mobile=${phoneNumber}&otp=${otp}&sender=MSGIND&message=Your Presaka OTP is ${otp}. Valid for 5 minutes.`
);
```

---

## 📊 Check SMS Status

1. **Login to MSG91 Dashboard**
2. Go to **"Reports"** → **"SMS Logs"**
3. You can see:
   - SMS sent
   - Delivery status
   - Failed messages
   - Remaining credits

---

## 💰 Costs

- **Free Credits:** 100-200 SMS on signup
- **Cost per SMS:** ₹0.15 - ₹0.25 per SMS
- **Perfect for testing!**

---

## 🔄 Switch Back to Console Logging

When you're done testing and want to go back to console logging:

```env
# Disable SMS
SMS_ENABLED=false
```

Restart the backend, and OTPs will be logged to console again.

---

## ✅ Summary

1. ✅ Sign up for MSG91 (free)
2. ✅ Get Auth Key from dashboard
3. ✅ Get Template ID (or use default)
4. ✅ Update `backend/.env`:
   ```env
   SMS_ENABLED=true
   SMS_API_KEY=your-key-here
   SMS_TEMPLATE_ID=your-template-id-here
   ```
5. ✅ Restart backend
6. ✅ Test with your real mobile number!

---

**Need help?** Check the backend console logs for detailed error messages.

**MSG91 Support:** https://msg91.com/help

