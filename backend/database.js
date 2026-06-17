const mongoose = require('mongoose');


async function connectDB() {
        try {
            await mongoose.connect(`${process.env.MONGO_URI}/saraData`);
            console.log('MongoDB connected successfully!');
            // Further operations after successful connection
        } catch (err) {
            console.error('MongoDB connection error:', err);
            // Handle connection errors
        }
    }

    connectDB();
    module.exports=connectDB;