

import asyncHandler from 'express-async-handler';



const sendMessage = asyncHandler(async (req, res) => {
    try {
        const text = req.body.message
        const name = req.body.name;
        const email = req.body.email;
        const message = await Message.create({ name, email, text });
        res.status(201).json({ message: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export { sendMessage };


// Get all messages (admins only)

const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.status(200).json({ result: messages.length, data: messages });
});

export { getMessages };


// Get a specific message (admins only)
const getMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) {
        res.status(404).json({ msg: `Couldn't find the requested message` })
    }
    res.status(200).json({ message: message })
})

export { getMessage };

