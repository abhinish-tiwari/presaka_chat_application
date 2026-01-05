# 🚀 Setup & Deployment Documentation

This folder contains all documentation related to setting up, configuring, and deploying Preṣaka.

---

## 📋 Contents

### Quick Start

- **[QUICK_START.md](QUICK_START.md)** - Complete development environment setup guide
  - Prerequisites installation
  - Backend setup
  - Frontend setup
  - Database configuration
  - Running the application

### SMS/OTP Configuration

- **[SMS_SETUP_GUIDE.md](SMS_SETUP_GUIDE.md)** - Comprehensive SMS setup with Twilio
  - Twilio account creation
  - Phone number configuration
  - Environment variables
  - Testing SMS functionality
  
- **[QUICK_SMS_SETUP.md](QUICK_SMS_SETUP.md)** - Fast SMS configuration (5 minutes)
  - Quick Twilio setup
  - Essential configuration only
  
- **[ENABLE_SMS_NOW.md](ENABLE_SMS_NOW.md)** - Immediate SMS activation
  - One-command setup
  - Troubleshooting

### Deployment

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
  - Environment setup
  - Database migration
  - Server configuration
  - SSL/HTTPS setup
  - Monitoring setup
  - Scaling strategies

---

## 🎯 Quick Navigation

### I want to...

**...set up my development environment**  
→ Start with [QUICK_START.md](QUICK_START.md)

**...enable SMS authentication**  
→ Use [QUICK_SMS_SETUP.md](QUICK_SMS_SETUP.md) for fast setup  
→ Or [SMS_SETUP_GUIDE.md](SMS_SETUP_GUIDE.md) for detailed guide

**...deploy to production**  
→ Follow [DEPLOYMENT.md](DEPLOYMENT.md)

**...troubleshoot SMS issues**  
→ Check [ENABLE_SMS_NOW.md](ENABLE_SMS_NOW.md)

---

## 📊 Setup Checklist

### Development Setup
- [ ] Install Node.js 18+
- [ ] Install PostgreSQL 14+
- [ ] Install Redis 7+
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Test the application

### SMS Setup (Optional)
- [ ] Create Twilio account
- [ ] Get Twilio phone number
- [ ] Configure Twilio credentials
- [ ] Test SMS sending
- [ ] Verify OTP flow

### Production Deployment
- [ ] Set up production server
- [ ] Configure domain and DNS
- [ ] Set up SSL certificates
- [ ] Configure production database
- [ ] Set up Redis instance
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Set up monitoring
- [ ] Test production deployment

---

## 🔗 Related Documentation

- [Architecture Overview](../architecture/ARCHITECTURE.md) - Understand the system design
- [Database Schema](../architecture/DATABASE.md) - Database structure
- [API Documentation](../api/API.md) - API endpoints
- [Security Practices](../architecture/SECURITY.md) - Security guidelines

---

## 💡 Tips

### Development
- Use `npm run dev` for hot-reloading during development
- Check logs in `backend/logs/` for debugging
- Use PostgreSQL GUI tools like pgAdmin for database inspection

### SMS Testing
- Use Twilio test credentials for development
- Test with your own phone number first
- Check Twilio console for SMS logs

### Deployment
- Always test in staging before production
- Use environment-specific configuration files
- Set up automated backups
- Monitor application logs

---

**Need help?** Check the [main documentation](../README.md) or open an issue on GitHub.

