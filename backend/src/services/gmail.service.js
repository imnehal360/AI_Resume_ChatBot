const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const TOKEN_PATH = path.join(__dirname, "../config/token.json");



const CREDENTIALS_PATH = path.join(__dirname, "../config/credentials.json");

// console.log("DEBUG __dirname =", __dirname);
// console.log("DEBUG looking for credentials at =", CREDENTIALS_PATH);
// console.log(
//   "DEBUG exists?",
//   fs.existsSync(CREDENTIALS_PATH)
// );


function getAuthClient() {
  const envClientId = process.env.GOOGLE_CLIENT_ID;
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const envRedirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (envClientId && envClientSecret && envRedirectUri) {
    return new google.auth.OAuth2(
      envClientId,
      envClientSecret,
      envRedirectUri
    );
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error("Credentials not found in Environment (GOOGLE_CLIENT_ID, etc.) or credentials.json");
  }

  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf-8")
  );

  const { client_secret, client_id, redirect_uris } =
    credentials.installed;

  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
}

const readline = require("readline");

async function authorize() {
  const oAuth2Client = getAuthClient();

  // 1. Try Environment Variable
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    return oAuth2Client;
  }

  // 2. Try Local File
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(
      JSON.parse(fs.readFileSync(TOKEN_PATH))
    );
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\nAuthorize this app by visiting this url:\n");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question("\nEnter the code from that page here: ", (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // If we are here, we are likely in local dev or initial setup.
  // We can save to file BUT we should also log it for the user to put in ENV.
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("✅ Token stored to", TOKEN_PATH);

  return oAuth2Client;
}


async function fetchPerplexityEmails() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  // Read emails ONLY from Perplexity
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "from:perplexity.ai",
    maxResults: 5
  });

  if (!res.data.messages) return [];

  const emails = [];

  for (const msg of res.data.messages) {
    const message = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full"
    });

    const parts = message.data.payload.parts || [];
    const textPart = parts.find(
      (p) => p.mimeType === "text/plain"
    );

    if (textPart?.body?.data) {
      const decoded = Buffer
        .from(textPart.body.data, "base64")
        .toString("utf-8");

      emails.push(decoded);
    }
  }

  return emails;
}

module.exports = { fetchPerplexityEmails, authorize };
