const mongoose = require("mongoose");

//secure
const dotenv = require("dotenv");
dotenv.config();

const db = process.env.DATABASE;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("database connection successful.....");
}).catch((err) => {
    console.log("error connecting", err);
})
