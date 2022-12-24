const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors')

//secure
const dotenv = require("dotenv");
dotenv.config();

app.use(cors())

require("./db/connect");
require("./models/user");



app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

// HEROKU DEPLOY CODE

if (process.env.NODE_ENV == "production") {
    app.use(express.static("client/build"))

    const path = require('path')
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
})