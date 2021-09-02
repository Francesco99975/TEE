import http from "http";
import express from  "express";
import mongoose from "mongoose";
import cron from "node-cron";
import Encode from "./models/encode";
import teeRoutes from "./routes/tee";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

let result = dotenv.config();

if (result.error) console.log(result.error);


const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });

const app = express();
app.set('trust proxy', 1);

cron.schedule('59 23 * * 7', async () => {
    try {
        console.log("Resetting Database");
        await Encode.deleteMany();
    } catch (error) {
        console.log(error);
    }
});

app.use(limiter);

app.use(express.static(process.cwd()+"/tee-app"));

app.use(express.json());

app.get('/', (req, res, next) => {
    return res.sendFile(process.cwd()+"/tee-app/index.html");
});

app.use('/tee', teeRoutes);

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI!, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on PORT: ${PORT}`);
    });
})
.catch(() => {
    console.log('Could not connect to DB');
});

