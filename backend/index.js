const express = require("express")
const app = express()
const dns = require("dns")
//DNS
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
//cors
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(express.json())
app.use(cors(corsOptions));
dns.setServers(["1.1.1.1","8.8.8.8"])
///////////////////////////////
const salesAgent = require("./routes/salesAgent.routes")
const lead = require("./routes/lead.routes")


app.use("/api/agents",salesAgent)
app.use("/api/leads",lead)


const PORT = process.env.PORT || 3000
initializeDatabase().then(()=>{

    app.listen(PORT,()=>{
    console.log("Server started successfully!"); 
})
}).catch((e) =>{
    console.log("Error while connecting DB");
    
})
