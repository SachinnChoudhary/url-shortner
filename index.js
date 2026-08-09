require("dotenv").config();
const express = require("express");
const urlRoute = require("./routes/url");
const { connectToMongoDB } = require("./connect")
const URL = require("./models/url");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8001;

connectToMongoDB(process.env.MONGODB_URI)
  .then(() => console.log('Mongodb Connected.'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));
const clientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...clientUrls,
    "https://shrnk-url.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);


app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "URL Shortener Backend API is running" });
});

app.use("/url", urlRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push:
        {
            visitHistory: {
                timestamp: Date.now(),
            },
        },
    }
    );

    if (!entry) {
        return res.status(404).json({ error: "Short URL not found" });
    }

    if (req.query.json === 'true' || req.headers.accept?.includes('application/json')) {
        return res.json({ redirectURL: entry.redirectURL });
    }

    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));


