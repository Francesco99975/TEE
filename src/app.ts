import http from "http";
import express from  "express";
import mongoose from "mongoose";
import cron from "node-cron";
import Encode from "./models/encode";
import teeRoutes from "./routes/tee";
import dotenv from "dotenv";

let result = dotenv.config();

if (result.error) console.log(result.error);


const PORT = process.env.PORT || 5000;

const app = express();

cron.schedule('59 23 * * 7', async () => {
    try {
        console.log("Resetting Database");
        await Encode.deleteMany();
    } catch (error) {
        console.log(error);
    }
});

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

