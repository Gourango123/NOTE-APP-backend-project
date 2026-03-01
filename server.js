require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/bd");

const serverRun = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("Server running failed:", error.message);
    }
}

serverRun();