const mongoose = require("mongoose")
const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])
require("dotenv").config()
const mongoUri  = process.env.MONGO_URI
const initializeDatabase =async() =>{
await mongoose.connect(mongoUri).then(() =>{
    console.log("DB connected");
}).catch((e) =>{
    console.log("Error connecting DB", e.message);
})
}

module.exports = {initializeDatabase}