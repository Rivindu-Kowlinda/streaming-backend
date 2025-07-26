const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const cloudinary = require('./cloudinary');
const Video = require('./Video');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Upload endpoint
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const title = req.body.title;

    const uploadRes = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'videos'
    });

    const newVideo = new Video({
      title,
      videoUrl: uploadRes.secure_url
    });

    await newVideo.save();
    res.status(201).json({ message: "Uploaded!", video: newVideo });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all videos
app.get('/videos', async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
