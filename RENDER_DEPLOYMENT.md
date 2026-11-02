# FoodMitra - Render.com Deployment Guide (Step-by-Step)

यह गाइड आपको अपने **FoodMitra** प्रोजेक्ट को GitHub के ज़रिए **Render.com** पर फ्री में 100% लाइव (Deploy) करने में मदद करेगी।

---

### Step 1: GitHub पर कोड अपलोड करें (Push Code to GitHub)

1. अपने कंप्यूटर पर टर्मिनल या Git Bash खोलें।
2. इस प्रोजेक्ट फोल्डर में जाएं और निम्नलिखित कमांड्स चलाएं:
   ```bash
   git init
   git add .
   git commit -m "FoodMitra complete social impact food rescue platform"
   git branch -M main
   ```
3. GitHub पर जाकर एक नया रिपॉजिटरी बनाएं (जैसे: `foodmitra`).
4. रिपॉजिटरी को लिंक करके पुश करें:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/foodmitra.git
   git push -u origin main
   ```

---

### Step 2: Render.com पर अकाउंट बनाएं और नया Web Service बनाएं

1. [https://render.com](https://render.com) पर जाएं और अपने GitHub अकाउंट से Sign In करें।
2. डैशबोर्ड पर ऊपर दाईं ओर **"New +"** बटन पर क्लिक करें।
3. **"Web Service"** चुनें।
4. **"Build and deploy from a Git repository"** पर क्लिक करें।
5. अपनी **foodmitra** रिपॉजिटरी को सेलेक्ट करें और **"Connect"** पर क्लिक करें।

---

### Step 3: Render की सेटिंग्स (Configuration Settings) भरें

फॉर्म में ठीक नीचे दिए गए विकल्प दर्ज करें:

| फ़ील्ड (Field) | क्या भरना है (Value) |
| :--- | :--- |
| **Name** | `foodmitra` (या अपनी पसंद का नाम) |
| **Region** | `Singapore` (भारत के लिए सबसे तेज़) या `Oregon (US)` |
| **Branch** | `main` |
| **Language / Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` ($0/month) |

---

### Step 4: पर्यावरण चर (Environment Variables) जोड़ें

उसी पेज पर नीचे स्क्रॉल करें और **"Advanced"** या **"Environment Variables"** सेक्शन में जाएं:

**"Add Environment Variable"** पर क्लिक करें और ये 3 वेरिएबल्स डालें:

1. **Key:** `NODE_ENV`  
   **Value:** `production`

2. **Key:** `PORT`  
   **Value:** `10000` (Render का डिफ़ॉल्ट पोर्ट, हमारा सर्वर इसे स्वतः पढ़ लेगा)

3. **Key:** `JWT_SECRET`  
   **Value:** `foodmitra-super-secret-key-college-2026` (या कोई भी सुरक्षित स्ट्रिंग)

---

### Step 5: डिप्लॉय करें (Deploy)

1. सबसे नीचे नीले रंग के बटन **"Deploy Web Service"** पर क्लिक करें।
2. Render का बिल्ड लॉग चलना शुरू हो जाएगा:
   - `npm install` चलेगा
   - `npm run build` चलेगा (Vite आपके फ्रंटेंड को `dist/` में बंडल करेगा)
   - `npm run start` चलेगा (`tsx server.ts` सर्वर शुरू करेगा)
   - आपको लॉग में दिखेगा: `FoodMitra platform running on http://0.0.0.0:10000`
3. 2–3 मिनट में स्टेटस **"Live"** हो जाएगा।
4. आपको ऊपर एक लाइव URL मिलेगा, जैसे:  
   👉 `https://foodmitra.onrender.com`

---

### Step 6: टेस्ट करें (Live Testing)

आप सीधे अपने मोबाइल या लैपटॉप में उस लिंक को खोलकर:
- 1-Click Role Switcher से **Super Admin**, **Donor**, **NGO**, या **Volunteer** में लॉगिन कर सकते हैं।
- नया खाना लिस्ट कर सकते हैं।
- क्लेम और डिलीवरी का पूरा फ्लो लाइव दिखा सकते हैं।
