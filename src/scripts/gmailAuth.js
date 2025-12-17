require("dotenv").config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const CREDENTIALS_PATH = path.join(
  process.cwd(),
  "src",
  "config",
  "credentials.json"
);

const TOKEN_PATH = path.join(
  process.cwd(),
  "src",
  "config",
  "token.json"
);

function getAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } =
    credentials.installed;

  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
}

async function runAuth() {
  const oAuth2Client = getAuthClient();

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\nAuthorize this app by visiting this URL:\n");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nPaste the FULL code from the browser URL here:\n", async (code) => {
    rl.close();

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log("\n✅ token.json created successfully!");
    } catch (err) {
      console.error("❌ Error retrieving token", err);
    }
  });
}

runAuth();
