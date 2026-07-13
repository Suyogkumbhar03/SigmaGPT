import express from 'express';
import Thread from '../models/Thread.js'
import getOpenAIAPIResponse from "../utils/openai.js"

const router = express.Router();


//test
router.post("/test",async(req,res)=>{
    try{
        const thread = new Thread({
            threadId : "xyz123",
            title :"testing new thread"
        });

        const response = await thread.save();
        res.send(response)
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"faield to save in DB"})
    }
})


router.get("/thread",async(req,res)=>{
    try{
        const thread = await Thread.find({}).sort({updatedAt:-1})
        res.send(thread)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch threads"})
    }
})

router.get("/thread/:threadId",async(req,res)=>{
    const {threadId} = req.params;
    try{

        const thread = await Thread.findOne({threadId})
        if(!thread)
        {
           return res.status(404).json({error:"thread is not found"})
        }

        res.json(thread.messages);

    }catch(err)
    {
        console.log(err);
        res.status(500).json({error:"failed to fetch chat"})
    }
})


router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId} = req.params;

    try{

        const deleteThread = await Thread.findOneAndDelete({threadId});

        if(!deleteThread)
        {
            return res.status(404).json({error:"thread not found"})
        }

        res.status(200).json({error:"thread deleted successfully"})
    

    }catch(err)
    {
        console.log(err);
        res.status(500).json({error:"failed to delete chat"})
    }
})

router.post("/chat",async(req,res)=>{

    const {threadId,message} = req.body;

    if(!threadId || !message)
    {
        res.status(400).json({error:"missing required fields"});
    }

    try{

        let thread = await Thread.findOne({threadId});
        if(!thread)
        {
            //create new thread in db
            thread = new Thread({
                threadId,
                title:message,
                messages:[{role:"user",content:message}]
            })
        }
        else{
            thread.messages.push({role:"user",content:message})
        }

        const assistantReply = await getOpenAIAPIResponse(message)

        thread.messages.push({role:"assistant",content:assistantReply})
        thread.updatedAt = new Date()

        await thread.save()
        res.json({reply:assistantReply})

    }catch(err)
    {
        console.log(err);
        res.status(500).json({error:"something went wrong"})
    }
})

export default router;