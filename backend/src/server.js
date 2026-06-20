require("dotenv").config();
const app = require("./app");
const { seedJobs } = require("./utils/seedJobs");
const connectDB = require("./config/db");


const PORT = process.env.PORT || 5000;

const runServer = async () => {
  try {
    await connectDB();
    await seedJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

runServer();
