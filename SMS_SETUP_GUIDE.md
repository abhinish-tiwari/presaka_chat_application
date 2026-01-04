# SMS/OTP Setup Guide for Preṣaka

## 📱 Understanding OTP Delivery

By default, Preṣaka is configured for **development mode** where OTPs are **logged to the console** instead of being sent via SMS. This is intentional for easy testing without SMS costs.

---

## 🔧 Current Configuration

### Development Mode (Default)

**Status:** ✅ Active

**Behavior:**
- OTPs are **logged to the backend console**
- No actual SMS is sent
- No SMS provider credentials needed
- **Perfect for testing and development**

**How to use:**
1. Request OTP from the login page
2. Check the **backend terminal** for output like:
   ```
   📱 SMS to +919876543210: Your Preṣaka OTP is 123456. Valid for 5 minutes.
   ```
3. Copy the OTP and enter it in the login form

**Configuration in `backend/.env`:**
```env
SMS_ENABLED=false
```

---

## 🚀 Enable Real SMS (Production)

If you want to send **actual SMS to mobile numbers**, follow these steps:

### Option 1: MSG91 (Recommended for India)

MSG91 is a popular SMS provider in India with good rates and reliability.

#### Step 1: Sign Up for MSG91

1. Go to https://msg91.com/
2. Create a free account
3. Verify your email and phone number
4. You'll get some free SMS credits to start

#### Step 2: Get API Credentials

1. **Login to MSG91 Dashboard**
2. **Get Auth Key:**
   - Go to "Settings" → "API Keys"
   - Copy your Auth Key

3. **Create OTP Template:**
   - Go to "SMS" → "Templates"
   - Click "Create Template"
   - Template content:
     ```
     Your Presaka OTP is ##OTP##. Valid for 5 minutes. Do not share with anyone.
     ```
   - Submit for approval (usually approved within hours)
   - Copy the Template ID once approved

4. **Get Sender ID:**
   - Go to "SMS" → "Sender IDs"
   - Create a new Sender ID (e.g., "PRESAK")
   - Wait for approval (usually 1-2 days)

#### Step 3: Update Backend Configuration

Edit `backend/.env`:

```env
# Enable SMS
SMS_ENABLED=true

# MSG91 Configuration
SMS_PROVIDER=msg91
SMS_API_KEY=your-actual-msg91-auth-key-here
SMS_SENDER_ID=PRESAK
SMS_TEMPLATE_ID=your-actual-template-id-here
```

#### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

#### Step 5: Test

1. Request OTP from the login page
2. You should receive an actual SMS on your mobile
3. Check backend logs for confirmation:
   ```
   OTP sent successfully to +919876543210
   ```

---

### Option 2: Twilio (International)

Twilio works globally and is very reliable.

#### Step 1: Sign Up for Twilio

1. Go to https://www.twilio.com/
2. Create a free account
3. Get $15 free credit

#### Step 2: Get Credentials

1. **Account SID** - From Twilio Console
2. **Auth Token** - From Twilio Console
3. **Phone Number** - Get a Twilio phone number

#### Step 3: Implement Twilio Integration

The code structure is already in place. You need to implement the Twilio section in `backend/src/services/sms.service.js`:

```javascript
// Twilio SMS provider
if (process.env.SMS_PROVIDER === 'twilio') {
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your Preṣaka OTP is ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  logger.info(`OTP sent successfully to ${phone} via Twilio`);
  return { success: true };
}
```

#### Step 4: Update .env

```env
SMS_ENABLED=true
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

---

## 🧪 Testing

### Test in Development Mode (Console Logging)

```bash
# Make sure SMS is disabled
SMS_ENABLED=false
```

1. Start backend: `npm run dev`
2. Request OTP from frontend
3. Check backend console for OTP
4. Use the OTP to login

### Test with Real SMS

```bash
# Enable SMS
SMS_ENABLED=true
```

1. Make sure you have valid API credentials
2. Start backend: `npm run dev`
3. Request OTP from frontend
4. Check your mobile for SMS
5. Use the OTP to login

---

## 💰 Cost Considerations

### MSG91 Pricing (India)
- **Transactional SMS:** ₹0.15 - ₹0.25 per SMS
- **Free Credits:** Usually 100-200 SMS on signup
- **Bulk Rates:** Cheaper for higher volumes

### Twilio Pricing (Global)
- **SMS:** $0.0075 - $0.02 per SMS (varies by country)
- **Free Credits:** $15 on signup
- **India SMS:** ~$0.0075 per SMS

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Keep them in `.env` file
   - `.env` is in `.gitignore`

2. **Use environment variables**
   - Different keys for dev/staging/production

3. **Monitor usage**
   - Set up alerts for unusual SMS volumes
   - Prevent SMS bombing attacks

4. **Rate limiting**
   - Already implemented: 3 OTP requests per 10 minutes per phone number

---

## 🐛 Troubleshooting

### OTP not appearing in console

**Check:**
- Backend server is running
- `SMS_ENABLED=false` in `.env`
- Check backend logs for errors

### SMS not being sent

**Check:**
- `SMS_ENABLED=true` in `.env`
- Valid API credentials
- Phone number format is correct (+91XXXXXXXXXX)
- SMS provider account has credits
- Template is approved (for MSG91)
- Check backend logs for error messages

### Invalid phone number error

**Check:**
- Phone number must start with `+91`
- Must be 10 digits after +91
- Format: `+919876543210`

---

## 📝 Summary

**For Development/Testing:**
- Keep `SMS_ENABLED=false`
- OTPs will be logged to console
- No SMS costs
- Easy testing

**For Production:**
- Set `SMS_ENABLED=true`
- Configure MSG91 or Twilio
- Real SMS will be sent
- Monitor costs and usage

---

**Current Status:** Development mode (Console logging) ✅

To enable real SMS, follow the steps above for your preferred provider.

