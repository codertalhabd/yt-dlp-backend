const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const axios = require("axios");
require('dotenv').config();
const fs = require('fs');

const app = express();
app.use(cors());

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
app.get("/download", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: "URL is required!" });
    }
    fs.writeFileSync('cookies.txt', process.env.YOUTUBE_COOKIES);
    const command = `./yt-dlp --cookies cookies.txt -j "${videoUrl}"`;

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

                    downloadLinks[label] = `http://127.0.0.1:5000/force_download?video_id=${videoInfo.id}&format_id=${format.format_id}`;
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

// Route to force file download
app.get("/force_download", async (req, res) => {
    const videoId = req.query.video_id;
    const formatId = req.query.format_id;

    if (!videoId || !formatId) {
        return res.status(400).json({ error: "video_id and format_id are required!" });
    }

    const command = `yt-dlp -j -f ${formatId} "https://www.youtube.com/watch?v=${videoId}"`;

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || "Failed to fetch video download link!" });
        }

        try {
            const videoInfo = JSON.parse(stdout);
            const fileUrl = videoInfo.url;
            const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, "_");
            const fileExt = videoInfo.ext;

            const headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Referer": "https://www.youtube.com/"
            };

            const response = await axios.get(fileUrl, { responseType: "stream", headers });

            res.setHeader("Content-Disposition", `attachment; filename="${videoTitle}.${fileExt}"`);
            res.setHeader("Content-Type", response.headers["content-type"]);

            response.data.pipe(res);
        } catch (parseError) {
            res.status(500).json({ error: "Error parsing video download data!" });
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});