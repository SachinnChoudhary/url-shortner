require("dotenv").config();
const express = require("express");
const urlRoute = require("./routes/url");
const { connectToMongoDB } = require("./connect")
const URL = require("./models/url");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8001;

connectToMongoDB(process.env.MONGODB_URI).then(() => console.log('Mongodb Connected.'))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
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

    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));


