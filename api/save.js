export default async function handler(request, response) {
  if (request.method !== "PUT" && request.method !== "POST") {
    return response.status(405).send("Method Not Allowed");
  }

  const binId = process.env.BIN_ID;
  const key = process.env.MASTER_KEY;

  if (!binId || !key) {
    return response.status(500).json({ error: "Missing env vars" });
  }

  let parsed;
  try {
    parsed = request.body;
  } catch (e) {
    return response.status(400).json({ error: "Invalid JSON" });
  }

  if (Array.isArray(parsed)) {
    parsed = { novels: parsed, users: [], messages: [], community: [] };
  } else if (typeof parsed === "object" && parsed !== null) {
    if (!Array.isArray(parsed.novels)) parsed.novels = [];
    if (!Array.isArray(parsed.users)) parsed.users = [];
    if (!Array.isArray(parsed.messages)) parsed.messages = [];
    if (!Array.isArray(parsed.community)) parsed.community = [];
  } else {
    parsed = { novels: [], users: [], messages: [], community: [] };
  }

  try {
    const r = await fetch("https://api.jsonbin.io/v3/b/" + binId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": key
      },
      body: JSON.stringify(parsed)
    });
    const data = await r.json();
    return response.status(200).json(data);
  } catch (e) {
    return response.status(500).json({ error: "Failed to save" });
  }
}
