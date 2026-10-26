export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }
  if (request.method !== "POST") {
    return response.status(405).send("Method Not Allowed");
  }

  const binId = process.env.BIN_ID;
  const key = process.env.MASTER_KEY;

  if (!binId || !key) {
    return response.status(500).json({ error: "Missing env vars" });
  }

  try {
    const body = request.body;
    const authorId = body?.authorId;

    if (!authorId || typeof authorId !== "string") {
      return response.status(400).json({ error: "Missing authorId" });
    }

    const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { "X-Master-Key": key }
    });

    if (!getResponse.ok) throw new Error("Failed to fetch data");

    const data = await getResponse.json();
    let record = data.record;

    if (Array.isArray(record)) {
      record = { novels: record, users: [], community: [], messages: [] };
    } else if (!record || typeof record !== "object") {
      record = { novels: [], users: [], community: [], messages: [] };
    } else {
      if (!Array.isArray(record.users)) record.users = [];
      if (!Array.isArray(record.novels)) record.novels = [];
      if (!Array.isArray(record.community)) record.community = [];
      if (!Array.isArray(record.messages)) record.messages = [];
    }

    const userIndex = record.users.findIndex(u => u.authorId === authorId);
    if (userIndex === -1) {
      return response.status(404).json({ error: "User not found" });
    }

    const currentTimestamp = Date.now();
    record.users[userIndex].lastSeen = currentTimestamp;

    const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": key },
      body: JSON.stringify(record)
    });

    if (!putResponse.ok) throw new Error("Failed to save");

    return response.status(200).json({ ok: true, lastSeen: currentTimestamp });

  } catch (error) {
    return response.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
