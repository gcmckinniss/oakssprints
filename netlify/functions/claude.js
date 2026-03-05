const https = require("https");

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: "API key not configured" } }) };
  }

  return new Promise(function(resolve) {
    const body = event.body;
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      }
    };

    const req = https.request(options, function(res) {
      let data = "";
      res.on("data", function(chunk) { data += chunk; });
      res.on("end", function() {
        resolve({
          statusCode: res.statusCode,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: data
        });
      });
    });

    req.on("error", function(err) {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: { message: err.message } })
      });
    });

    req.write(body);
    req.end();
  });
};
