const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

// yt-dlp ইনস্টল করা হচ্ছে
const installYtDlp = () => {
    exec("curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp", 
    (error, stdout, stderr) => {
        if (error) {
            console.error(`yt-dlp installation error: ${stderr}`);
        } else {
            console.log(`yt-dlp installed successfully: ${stdout}`);
        }
    });
};

// Install yt-dlp before starting the server
installYtDlp();

// Function to convert resolution height to quality label
const getQualityLabel = (height) => {
    if (!height) return "Audio Only";
    if (height >= 2160) return "2160p (4K)";
    if (height >= 1440) return "1440p";
    if (height >= 1080) return "1080p";
    if (height >= 720) return "720p";
    if (height >= 480) return "480p";
    if (height >= 360) return "360p";
    return "Low Quality";
};

// Route to fetch YouTube video/audio download links
app.get("/api/download", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: "URL is required!" });
    }

    const command = `yt-dlp -j "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || "Failed to fetch video info!" });
        }

        try {
            const videoInfo = JSON.parse(stdout);
            const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, "_");
            const thumbnailUrl = videoInfo.thumbnail;
            const formats = videoInfo.formats;

            let downloadLinks = {};

            formats.forEach(format => {
                if (format.url && (format.ext === "mp4" || format.ext === "m4a") && !format.url.includes("m3u8")) {
                    const qualityLabel = getQualityLabel(format.height);
                    const hasAudio = format.acodec !== "none";

                    let label = format.ext === "m4a" ? "Audio Only (m4a)"
                        : hasAudio ? `Full Video ${qualityLabel} (mp4)`
                        : `Video Only ${qualityLabel} (mp4)`;

                    downloadLinks[label] = format.url;
                }
            });

            res.json({
                title: videoTitle,
                thumbnail: thumbnailUrl,
                download_links: downloadLinks
            });

        } catch (parseError) {
            res.status(500).json({ error: "Error parsing video data!" });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});