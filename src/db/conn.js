const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connection successful");
})
.catch((err) => {
    console.error("Connection failed!", err);
});
