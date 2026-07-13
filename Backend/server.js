import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(cors())

app.use("/api",chatRoutes)

app.listen(PORT, () => {
    console.log(`server is running on  ${PORT}`);
    connectDB();
})

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected with database")
    }catch(err){
        console.log("Faield to connect with DB: ",err)
    }
}

// app.post("/test", async(req, res) => {

//     const options = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: 'openrouter/free',
//             messages: [
//                 {
//                     role: 'user',
//                     content: req.body.message
//                 }
//             ]
//         })
//     };
//     try {
//        const response = await fetch("https://openrouter.ai/api/v1/chat/completions",options);
//        const data = await response.json();
//        console.log(data.choices[0].message.content)
//         res.send(data)
//     }
//     catch (err) {
//         console.log(err)
//     }

// })




































// import OpenAI from 'openai';
// import 'dotenv/config';

// const client = new OpenAI({
//   apiKey: process.env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1"
// });

// const response = await client.chat.completions.create({
//   model: 'openrouter/free',
//   messages: [
//   {
//     role: 'user',
//     content: 'Are semicolons optional in JavaScript?'
//   }
// ]
// });
// console.log(response.choices[0].message.content);