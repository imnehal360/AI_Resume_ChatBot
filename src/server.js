require("dotenv").config();
const app = require("./app");
const { seedJobs } = require("./utils/seedJobs");
const connectDB = require("./config/db");

const { fetchPerplexityEmails } = require("./services/gmail.service");



const PORT = process.env.PORT || 5000;

connectDB();
seedJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
