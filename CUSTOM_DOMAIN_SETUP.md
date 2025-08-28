# 🌐 Custom Domain Setup for WhatsApp Task Manager Bot

## 🎯 Overview

Instead of using `https://whatsapp-taskbot.pages.dev`, you can connect your own custom domain like:
- `https://taskbot.yourdomain.com`
- `https://whatsapp.yourdomain.com`  
- `https://bot.yourcompany.com`

## 📋 Prerequisites

✅ **Own a domain** (e.g., `yourdomain.com`)  
✅ **Access to domain DNS settings** (via your domain registrar)  
✅ **Cloudflare Pages deployed** (whatsapp-taskbot project)  

## 🔧 Method 1: Using Cloudflare as DNS (Recommended)

### Step 1: Add Domain to Cloudflare

1. **Login to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Add Site** → Enter your domain: `yourdomain.com`
3. **Choose Plan** → Free plan is sufficient
4. **Cloudflare will scan** your existing DNS records
5. **Review and Continue**

### Step 2: Update Nameservers

1. **Cloudflare provides nameservers** like:
   ```
   fname.ns.cloudflare.com
   gname.ns.cloudflare.com
   ```

2. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
3. **Update nameservers** to Cloudflare's nameservers
4. **Wait 24-48 hours** for propagation (usually faster)

### Step 3: Add Custom Domain to Pages

1. **Go to Cloudflare Pages** → Your project (`whatsapp-taskbot`)
2. **Custom domains** tab
3. **Set up a custom domain**
4. **Enter subdomain**: `taskbot.yourdomain.com` or `bot.yourdomain.com`
5. **Add domain** → Cloudflare will automatically configure DNS

### Step 4: Verify Domain

- **DNS automatically configured** by Cloudflare
- **SSL certificate** automatically issued
- **Domain active** within minutes

## 🔧 Method 2: External DNS (Keep Current DNS Provider)

### Step 1: Get Cloudflare Pages IP/CNAME

From your Cloudflare Pages project:
1. **Custom domains** → **Set up a custom domain**
2. **Note the CNAME target**: Usually something like `whatsapp-taskbot.pages.dev`

### Step 2: Configure DNS at Your Provider

**Option A: Subdomain (Recommended)**
```
Type: CNAME
Name: taskbot
Target: whatsapp-taskbot.pages.dev
TTL: 300 (or Auto)
```

**Option B: Root Domain**
```
Type: CNAME  
Name: @ (or leave blank)
Target: whatsapp-taskbot.pages.dev
TTL: 300
```

### Step 3: Add Domain in Cloudflare Pages

1. **Cloudflare Pages** → **Custom domains**
2. **Add domain**: `taskbot.yourdomain.com`
3. **Verify ownership** (may require DNS TXT record)

### Step 4: Wait for SSL

- **SSL certificate** provisioning: 10-15 minutes
- **Domain propagation**: Up to 48 hours
- **Check status** in Cloudflare Pages dashboard

## 🏢 Method 3: Business Domain Examples

### For Business Use:
```
https://whatsapp.mallardroofing.com/webhook
https://tasks.mallardroofing.com/webhook  
https://bot.mallardroofing.com/webhook
https://api.mallardroofing.com/webhook
```

### DNS Configuration:
```
Type: CNAME
Name: whatsapp
Target: whatsapp-taskbot.pages.dev
TTL: 300
```

## ⚙️ Update WhatsApp Webhook Configuration

After domain setup, update your WhatsApp Business API:

### Old Webhook URL:
```
https://whatsapp-taskbot.pages.dev/webhook
```

### New Webhook URL:
```
https://taskbot.yourdomain.com/webhook
```

### Update Steps:
1. **Facebook Developer Console** → Your WhatsApp app
2. **WhatsApp** → **Configuration** → **Webhook**  
3. **Update Callback URL** to your new domain
4. **Verify and Save**

## 🔒 SSL Certificate & Security

### Automatic SSL:
- **Cloudflare provides** free SSL certificates
- **Auto-renewal** handled by Cloudflare
- **Always HTTPS** option available

### Security Headers (Optional):
Add in Cloudflare Pages settings:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 🧪 Testing Your Custom Domain

### 1. Test Basic Connectivity:
```bash
curl https://taskbot.yourdomain.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Webhook Endpoint:
```bash
curl https://taskbot.yourdomain.com/webhook?hub.mode=subscribe&hub.verify_token=taskbot_verify_token_2025&hub.challenge=test123
# Should return: test123
```

### 3. Test WhatsApp Integration:
- Send "help" to your WhatsApp Business number
- Should receive bot response with commands

## 🎯 Domain Recommendations

### Best Practices:
- **Use subdomain**: `bot.yourdomain.com` (easier to manage)
- **Short and memorable**: `chat.yourdomain.com`
- **Business relevant**: `whatsapp.yourcompany.com`

### Examples by Industry:
```
Construction: whatsapp.mallardroofing.com
Restaurant: orders.pizzaplace.com
Retail: support.yourstore.com
Service: booking.yourservice.com
```

## 🔧 Troubleshooting

### Common Issues:

**1. Domain not working:**
- Check DNS propagation: https://whatsmydns.net
- Verify CNAME points to correct target
- Wait up to 48 hours for full propagation

**2. SSL certificate issues:**
- Check certificate status in Cloudflare Pages
- Ensure domain verification completed
- May take 15-30 minutes for certificate

**3. WhatsApp webhook errors:**
- Update webhook URL in Facebook Developer console
- Test webhook endpoint directly with curl
- Check Cloudflare Pages function logs

### DNS Propagation Check:
```bash
dig taskbot.yourdomain.com
nslookup taskbot.yourdomain.com
```

## 💡 Pro Tips

### 1. Multiple Environments:
```
Development: dev-bot.yourdomain.com
Staging: staging-bot.yourdomain.com  
Production: bot.yourdomain.com
```

### 2. Load Balancing:
- Use Cloudflare Load Balancer for high availability
- Configure multiple origins if needed

### 3. Analytics:
- Enable Cloudflare Analytics for domain traffic
- Monitor webhook requests and responses

## 📋 Final Checklist

After domain setup:

- [ ] **Domain resolves** to Cloudflare Pages
- [ ] **SSL certificate** is active and valid
- [ ] **Health endpoint** responds correctly
- [ ] **Webhook endpoint** verifies properly  
- [ ] **WhatsApp API** updated with new webhook URL
- [ ] **Test messages** work through WhatsApp
- [ ] **Monitor** for any issues in first 24 hours

## 🎉 Benefits of Custom Domain

✅ **Professional appearance**: `bot.yourcompany.com` vs `random-name.pages.dev`  
✅ **Brand consistency**: Matches your business domain  
✅ **SSL included**: Automatic HTTPS with valid certificates  
✅ **Better trust**: Customers recognize your domain  
✅ **Control**: Full control over domain and subdomain structure  

Your WhatsApp Task Manager Bot will be accessible at your custom domain within a few hours of DNS propagation! 🚀