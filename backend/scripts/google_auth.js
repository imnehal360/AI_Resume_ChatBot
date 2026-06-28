require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const readline = require("readline");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const CREDENTIALS_PATH = path.join(__dirname, "../src/config/credentials.json");

function getAuthClient() {
  const envClientId = process.env.GOOGLE_CLIENT_ID;
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const envRedirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (envClientId && envClientSecret && envRedirectUri) {
    return new google.auth.OAuth2(envClientId, envClientSecret, envRedirectUri);
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error("Credentials not found in Environment (GOOGLE_CLIENT_ID, etc.) or credentials.json");
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function run() {
  try {
    const oAuth2Client = getAuthClient();

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // Force consent screen to ensure refresh token is returned
    });

    console.log("\n==========================================");
    console.log("👉 AUTHORIZE GMAIL FOR TECH RESUME BOT 👈");
    console.log("==========================================");
    console.log("1. Open the following URL in your browser:");
    console.log(`\n${authUrl}\n`);
    console.log("2. Sign in with your Google Account.");
    console.log("3. Authorize the application.");
    console.log("4. Copy the authorization code from the URL or screen.");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise((resolve) => {
      rl.question("\n🔑 Enter the authorization code here: ", (code) => {
        rl.close();
        resolve(code.trim());
      });
    });

    console.log("\nExchanging authorization code for tokens...");
    const { tokens } = await oAuth2Client.getToken(code);

    console.log("\n==========================================");
    console.log("✅ AUTHORIZATION SUCCESSFUL!");
    console.log("==========================================");
    console.log("Here is your new GOOGLE_REFRESH_TOKEN:\n");
    console.log(tokens.refresh_token);
    console.log("\n==========================================");
    console.log("📝 INSTRUCTIONS:");
    console.log("1. Copy the token above.");
    console.log("2. Open your '.env' file in the 'backend' folder.");
    console.log("3. Replace the GOOGLE_REFRESH_TOKEN line with:");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("==========================================\n");

  } catch (err) {
    console.error("❌ Authorization failed:", err.message);
  }
}

run();
