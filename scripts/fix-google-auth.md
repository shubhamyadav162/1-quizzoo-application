# Google Authentication Redirect Fix

आपकी Google लॉगिन समस्या का कारण है कि आप जब Google पर लॉग इन करते हैं, तो ऐप को वापस रीडायरेक्ट नहीं कर पा रहा है।

## Supabase और Google Cloud Console में आवश्यक परिवर्तन

### 1. Supabase में रीडायरेक्ट URL अपडेट करें

1. [Supabase Dashboard](https://app.supabase.com/) पर जाएं
2. अपनी प्रोजेक्ट (URL: `https://ozapkrljynijpffngjtt.supabase.co`) चुनें
3. बाईं तरफ मेनू से "Authentication" चुनें
4. फिर "Providers" टैब पर क्लिक करें
5. "Google" प्रोवाइडर ढूंढें और एडिट करें
6. "Redirect URL" फील्ड में, निम्नलिखित URL जोड़ें या अपडेट करें:
   ```
   quizzoo://auth/callback
   ```
   (हमारे app.json में "scheme" का मान "quizzoo" है, इसलिए हमें इसी स्कीम का उपयोग करना होगा)
7. सहेजें

### 2. Google Cloud Console में रीडायरेक्ट URI अपडेट करें

1. [Google Cloud Console](https://console.cloud.google.com/) पर जाएं
2. अपना प्रोजेक्ट चुनें
3. बाईं तरफ मेनू से "APIs & Services" -> "Credentials" पर जाएं
4. "OAuth 2.0 Client IDs" के तहत, आपके वेब क्लाइंट को ढूंढें और संपादित करें
5. "Authorized Redirect URIs" सेक्शन में, निम्नलिखित URIs जोड़ें (यदि पहले से नहीं हैं):
   ```
   https://ozapkrljynijpffngjtt.supabase.co/auth/v1/callback
   quizzoo://auth/callback
   ```
6. सहेजें

## Android Manifest में Intent फिल्टर्स की जांच

1. `android/app/src/main/AndroidManifest.xml` फाइल खोलें (यदि इसे मैन्युअली संपादित करना चाहते हैं)
2. सुनिश्चित करें कि आपके `MainActivity` में `intent-filter` है:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="quizzoo" android:host="auth" android:pathPrefix="/callback" />
</intent-filter>
```

## ऐप रीस्टार्ट करें

उपरोक्त परिवर्तन करने के बाद, ऐप को पूरी तरह से बंद करें और फिर से शुरू करें। अब Google लॉगिन आपके ऐप पर वापस रीडायरेक्ट होना चाहिए।

## डीप लिंक टेस्टिंग (वैकल्पिक)

यदि आप डीप लिंकिंग का परीक्षण करना चाहते हैं:

1. एंड्रॉइड पर, आप adb का उपयोग कर सकते हैं:
```
adb shell am start -W -a android.intent.action.VIEW -d "quizzoo://auth/callback" com.quizzoo.app
```

2. या इस URL को ब्राउज़र में खोलें:
```
quizzoo://auth/callback
```

यह आपके ऐप को खोलना चाहिए और रीडायरेक्ट को सही तरीके से संभालना चाहिए। 