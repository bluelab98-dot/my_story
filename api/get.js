export default async function handler(request, response) {
  const binId = process.env.BIN_ID;
  const key = process.env.MASTER_KEY;

  if (!binId || !key) {
    return response.status(500).json({ error: "Missing env vars" });
  }

  try {
    const r = await fetch("https://api.jsonbin.io/v3/b/" + binId + "/latest", {
      headers: { "X-Master-Key": key },
      cache: "no-store"
    });
    const data = await r.json();
    return response.status(200).json(data);
  } catch (e) {
    return response.status(500).json({ error: "Failed to fetch" });
  }
}
