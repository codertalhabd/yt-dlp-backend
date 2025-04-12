# YouTube Video Downloader API

A simple **YouTube Video & Audio Downloader API** using **Express.js** and `yt-dlp`. This API extracts video and audio download links from YouTube.

## 🚀 Features
- Get downloadable links for **video & audio**
- Supports **different resolutions (360p, 720p, 1080p, etc.)**
- Bypasses geo-restrictions
- Supports **CORS** for frontend integrations

## 🛠️ Installation

### **1️⃣ Clone the repository**
```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Install `yt-dlp` (Required)**
Make sure `yt-dlp` is installed and accessible globally:
```sh
pip install yt-dlp  # If using Python
```
Or install it locally for your project:
```sh
npm install -g yt-dlp
```

### **4️⃣ Set up environment variables**
Create a `.env` file and add:
```env
PORT=5000
YOUTUBE_COOKIES=your_cookie_data_here
```

## ▶️ Running the API
```sh
node server.js
```
Your API will run on `http://127.0.0.1:5000`

## 📌 API Endpoints

If you don't want to deploy the API yourself, you can use the following public API:
```
https://api.abutalhabd.xyz/download?url=YOUTUBE_VIDEO_URL
```

### **1️⃣ Get Download Links**
```http
GET /download?url=YOUTUBE_VIDEO_URL
```
#### **Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://i.ytimg.com/vi/video_id/hqdefault.jpg",
  "download_links": {
    "Audio Only (m4a)": "https://api.abutalhabd.xyz/force_download?video_id=xyz&format_id=140",
    "Video Only 720p (mp4)": "https://api.abutalhabd.xyz/force_download?video_id=xyz&format_id=136"
  }
}
```

### **2️⃣ Force Download**
```http
GET /force_download?video_id=VIDEO_ID&format_id=FORMAT_ID
```

## 🌐 Deploying to Render
1. Push your code to GitHub.
2. Go to **Render Dashboard** and create a new Web Service.
3. Select your repository and configure **Environment Variables**.
4. Deploy & get your API URL.

## 📜 License
This project is **for educational purposes only**. Use at your own risk.

---
**⚡ Created by MD Abu Talha Siam**
