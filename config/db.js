// const mongoose = require('mongoose');
// require('dotenv').config(); // Load .env variables

// const connectDB = async () => {
//     try {
//        await mongoose.connect('mongodb+srv://subhaskushwahak:subhas%401234@cluster0.v5vwpbb.mongodb.net/');
//         // await mongoose.connect('mongodb+srv://aayushpawar7748:9kt2pwbJ1u8hVTVZ@cluster0.zprlwo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

//         //await mongoose.connect('mongodb+srv://pawarharsh191:harsh123@cluster0.bq00w.mongodb.net/ProjectRid');
//         // await mongoose.connect('mongodb+srv://pawarharsh191:harsh123@cluster0.bq00w.mongodb.net/ProjectRid');
//       console.log("Mongodb connection successful");
//     } catch (error) {
//         console.error("MongoDB connection error:", error);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connection successful");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
