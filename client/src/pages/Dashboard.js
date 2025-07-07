import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ botData }) {
  const [channels, setChannels] = useState([]);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [message, setMessage] = useState('');
  const [serverSettings, setServerSettings] = useState(null);
  const [roles, setRoles] = useState([]);

  const loadGuildData = async (guildId) => {
    setSelectedGuild(guildId);

    const [channelsRes, settingsRes, rolesRes] = await Promise.all([
      axios.post("/api/guild-channels", { guildId }),
      axios.post("/api/guild-settings", { guildId }),
      axios.post("/api/guild-roles", { guildId })
    ]);

    setChannels(channelsRes.data.channels);
    setServerSettings(settingsRes.data);
    setRoles(rolesRes.data.roles);
  };

  const sendMessage = async (channelId) => {
    if (!message) return;
    await axios.post("/api/send-message", { channelId, message });
    alert("✅ Message sent");
  };

  const deleteMessages = async (channelId) => {
    const res = await axios.post("/api/delete-messages", { channelId });
    alert(`🧹 Deleted ${res.data.deleted} messages`);
  };

  const updateGuildName = async (newName) => {
    await axios.post("/api/update-guild-name", { guildId: selectedGuild, newName });
    alert("✅ Server name updated");
  };

  const createRole = async (name) => {
    await axios.post("/api/create-role", { guildId: selectedGuild, name });
    alert("🎨 Role created");
  };

  const deleteRole = async (roleId) => {
    await axios.post("/api/delete-role", { guildId: selectedGuild, roleId });
    alert("🗑️ Role deleted");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {botData.botName}</h2>

      <h3>Servers:</h3>
      <ul>
        {botData.guilds.map(guild => (
          <li key={guild.id}>
            <button onClick={() => loadGuildData(guild.id)}>{guild.name}</button>
          </li>
        ))}
      </ul>

      {serverSettings && (
        <div style={{ marginTop: "2rem" }}>
          <h3>⚙️ Server Settings</h3>
          <p><strong>Name:</strong> {serverSettings.name}</p>
          <input placeholder="New server name" onBlur={(e) => updateGuildName(e.target.value)} />
          <p><strong>Members:</strong> {serverSettings.memberCount}</p>
        </div>
      )}

      {roles.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>🎭 Roles:</h3>
          <ul>
            {roles.map(role => (
              <li key={role.id}>
                {role.name} <button onClick={() => deleteRole(role.id)}>Delete</button>
              </li>
            ))}
          </ul>
          <input placeholder="New role" onKeyDown={(e) => {
            if (e.key === "Enter") createRole(e.target.value);
          }} />
        </div>
      )}

      {channels.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h4>📚 Channels:</h4>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <ul>
            {channels.map(ch => (
              <li key={ch.id}>
                [{ch.type === 4 ? '📂' : '#'}] {ch.name}
                {ch.type !== 4 && (
                  <>
                    <button onClick={() => sendMessage(ch.id)}>Send</button>
                    <button onClick={() => deleteMessages(ch.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}