const express = require("express");
const cors = require("cors");
const path = require("path");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(cors());
app.use(express.json());

let botClient = null;

app.post("/api/login", async (req, res) => {
  const { token } = req.body;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message]
  });

  try {
    await client.login(token);
    botClient = client;
    const guilds = client.guilds.cache.map(g => ({ id: g.id, name: g.name }));
    res.json({ botName: client.user.username, guilds, token });
  } catch {
    res.status(401).json({ error: "Invalid Token" });
  }
});

app.post("/api/guild-channels", async (req, res) => {
  const { guildId } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  if (!guild) return res.status(404).json({ error: "Guild not found" });
  const channels = guild.channels.cache
    .filter(c => c.type === 0 || c.type === 4)
    .map(c => ({ id: c.id, name: c.name, type: c.type }));
  res.json({ channels });
});

app.post("/api/send-message", async (req, res) => {
  const { channelId, message } = req.body;
  try {
    const ch = await botClient.channels.fetch(channelId);
    await ch.send(message);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/delete-messages", async (req, res) => {
  const { channelId } = req.body;
  try {
    const ch = await botClient.channels.fetch(channelId);
    const messages = await ch.messages.fetch({ limit: 50 });
    const deletable = messages.filter(m => m.author.id === botClient.user.id);
    await ch.bulkDelete(deletable, true);
    res.json({ deleted: deletable.size });
  } catch {
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

app.post("/api/edit-message", async (req, res) => {
  const { channelId, messageId, newContent } = req.body;
  try {
    const ch = await botClient.channels.fetch(channelId);
    const msg = await ch.messages.fetch(messageId);
    if (msg.author.id !== botClient.user.id) return res.status(403).json({ error: "Not allowed" });
    await msg.edit(newContent);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to edit message" });
  }
});

app.post("/api/guild-settings", async (req, res) => {
  const { guildId } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  const members = await guild.members.fetch();
  res.json({ name: guild.name, memberCount: members.size });
});

app.post("/api/guild-roles", async (req, res) => {
  const { guildId } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  const roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name }));
  res.json({ roles });
});

app.post("/api/update-guild-name", async (req, res) => {
  const { guildId, newName } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  await guild.setName(newName);
  res.json({ success: true });
});

app.post("/api/create-role", async (req, res) => {
  const { guildId, name } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  await guild.roles.create({ name });
  res.json({ success: true });
});

app.post("/api/delete-role", async (req, res) => {
  const { guildId, roleId } = req.body;
  const guild = botClient.guilds.cache.get(guildId);
  const role = guild.roles.cache.get(roleId);
  if (role) await role.delete();
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ ClientCord Running on port " + PORT));