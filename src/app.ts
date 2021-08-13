import http from "http";
import express from  "express";
import mongoose from "mongoose";
import cors from "cors";
import teeRoutes from "./routes/tee";


const PORT = process.env.PORT || 5000;

const whitelist = [
    'http://localhost:4201',
    'http://localhost:4200',
    'http://localhost:4000',
    'http://localhost',
    'https://localhost',
    'http://localhost:81',
    'https://localhost:81',
    'http://192.168.0.38',
    'http://192.168.0.38:80',
    'http://192.168.0.38:81',
    'http://192.168.0.38:4201',
]

const app = express();

app.use(express.static(process.cwd()+"/tee-app"));

// app.use(cors({
//     origin: function (origin: any, callback) {
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }));
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

