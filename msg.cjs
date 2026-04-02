#!/usr/bin/env node
/**
 * msg — Inter-agent thread messaging and legacy messaging tool.
 *
 * Thread commands (per-project conversation thread):
 *   msg post @tag1 @tag2 "message"    Post to thread with tags
 *   msg poll                          Check unprocessed messages for me
 *   msg thread [limit]                View full project thread
 *   msg ack <messageId>               Mark message as processed
 *   msg handoff @agent "description"  Commit changes + notify next agent
 *   msg pull                          Pull latest from other agents
 *
 * Legacy commands (direct messaging):
 *   msg send <to> <message>           Send a direct message
 *   msg reply <to> <message>          Reply to agent
 *   msg list                          List pending messages
 *   msg conversation <peer>           View conversation
 *   msg history <session-id>          View history
 *   msg search <query>                Search history
 *
 * Conversation commands:
 *   msg conv list                     List conversations
 *   msg conv create <name> <m1> ...   Create a channel
 *   msg dm <target> <message>         Send a direct message
 *   msg chat <convId> @a1 message     Send to conversation with @mentions
 *
 * Environment:
 *   AO_SESSION_ID   Your session ID (auto-set)
 *   AO_PROJECT_ID   Your project ID (auto-set)
 *   AO_PORT         Orchestrator port (default: 4000)
 */

const http = require("http");

const PORT = process.env.AO_PORT || process.env.PORT || "4000";
const BASE = `http://localhost:${PORT}`;
const ME = process.env.AO_SESSION_ID || "";
const PROJECT_ID = process.env.AO_PROJECT_ID || "";
const GROUP_ID = process.env.AO_GROUP_ID || "";

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (_e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(`msg — Agent thread messaging

Thread commands:
  post @tag1 @tag2 "message"    Post to thread with @tags
  poll                          Check unprocessed messages for you
  thread [limit]                View full project thread
  ack <messageId>               Mark message as processed
  handoff @agent "description"  Commit changes + notify next agent
  pull                          Pull latest from other agents
  spawn <role>                  Spawn a child agent (shared workspace)

Legacy commands:
  send <to> <message>           Send a direct message
  reply <to> <message>          Reply to agent
  list                          List pending messages
  conversation <peer>           View conversation
  history <session-id>          View history
  search <query>                Search history

Conversation commands:
  conv list                     List conversations
  conv create <name> <m1> ...   Create a channel
  dm <target> <message>         Send a direct message
  chat <convId> @a1 message     Send to conversation with @mentions

Environment:
  AO_SESSION_ID                 Your session ID (auto-set)
  AO_PROJECT_ID                 Your project ID (auto-set)
  AO_PORT                       Orchestrator port (default: 4000)`);
    process.exit(0);
  }

  try {
    switch (cmd) {
      case "post": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        const tags = [];
        const contentParts = [];
        for (let i = 1; i < args.length; i++) {
          if (args[i].startsWith("@")) {
            tags.push(args[i].slice(1));
          } else {
            contentParts.push(args[i]);
          }
        }
        const content = contentParts.join(" ");
        if (!content) {
          console.error("Usage: msg post @tag1 @tag2 \"message\"");
          process.exit(1);
        }
        const res = await request("POST", `/api/projects/${PROJECT_ID}/thread`, {
          from: ME,
          tags,
          content,
          groupId: GROUP_ID || undefined,
        });
        if (res.status === 201) {
          console.log(`✓ Posted to thread (tags: ${tags.map(t => "@" + t).join(" ") || "none"})`);
          console.log(`  ID: ${res.body.message?.id || "posted"}`);
        } else {
          console.error(`✗ Failed: ${res.body.error || JSON.stringify(res.body)}`);
          process.exit(1);
        }
        break;
      }

      case "poll": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        const res = await request("GET", `/api/projects/${PROJECT_ID}/thread?for=${ME}&unprocessed=true${GROUP_ID ? `&groupId=${GROUP_ID}` : ""}`);
        const messages = res.body.messages || [];
        if (messages.length === 0) {
          console.log("No unprocessed messages.");
        } else {
          // Show the first unprocessed message as a task for the agent to execute
          const msg = messages[0];
          console.log(`INCOMING TASK from ${msg.from} (message ID: ${msg.id.substring(0, 8)}):`);
          console.log(`"${msg.content}"`);
          console.log("");
          console.log("YOU MUST DO THE FOLLOWING:");
          console.log(`1. Process this request: "${msg.content}"`);
          console.log(`2. After processing, run this command to send your answer back:`);
          console.log(`   node msg.cjs post @${msg.from} "YOUR_DETAILED_ANSWER_HERE"`);
          console.log(`3. Then acknowledge: node msg.cjs ack ${msg.id.substring(0, 8)}`);
          if (messages.length > 1) {
            console.log(`\n(${messages.length - 1} more message(s) waiting — poll again after processing this one)`);
          }
        }
        break;
      }

      case "thread": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        const limit = args[1] || "20";
        const res = await request("GET", `/api/projects/${PROJECT_ID}/thread?limit=${limit}${GROUP_ID ? `&groupId=${GROUP_ID}` : ""}`);
        const messages = res.body.messages || [];
        if (messages.length === 0) {
          console.log("Thread is empty.");
        } else {
          console.log(`Project thread (${messages.length} messages):\n`);
          for (const msg of messages) {
            const tagsStr = msg.tags.length > 0 ? ` → ${msg.tags.map(t => "@" + t).join(" ")}` : "";
            console.log(`  [${msg.from}${tagsStr}]: ${msg.content}`);
            console.log(`    id: ${msg.id.substring(0, 8)} | ${msg.timestamp}`);
          }
        }
        break;
      }

      case "ack": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        const messageId = args[1];
        if (!messageId) {
          console.error("Usage: msg ack <messageId>");
          process.exit(1);
        }
        const res = await request("POST", `/api/projects/${PROJECT_ID}/thread/${messageId}`, {
          sessionId: ME,
        });
        if (res.status === 200) {
          console.log(`✓ Acknowledged message ${messageId.substring(0, 8)}`);
        } else {
          console.error(`✗ Failed: ${res.body.error || JSON.stringify(res.body)}`);
          process.exit(1);
        }
        break;
      }

      case "send": {
        const [, to, ...msgParts] = args;
        const from = ME;
        const message = msgParts.join(" ");
        if (!from || !to || !message) {
          console.error("Usage: msg send <to> <message>");
          console.error("  AO_SESSION_ID must be set (auto-set in agent sessions)");
          process.exit(1);
        }
        const res = await request("POST", `/api/sessions/${to}/messages`, {
          from,
          type: "query",
          payload: message,
        });
        if (res.status === 200 || res.status === 201) {
          console.log(`✓ Message sent from ${from} to ${to}`);
          console.log(`  ID: ${res.body.message?.id || "sent"}`);
        } else {
          console.error(`✗ Failed: ${res.body.error || JSON.stringify(res.body)}`);
          process.exit(1);
        }
        break;
      }

      case "reply": {
        const [, to, ...msgParts] = args;
        const message = msgParts.join(" ");
        if (!ME || !to || !message) {
          console.error("Usage: msg reply <to> <message>");
          process.exit(1);
        }
        const res = await request("POST", `/api/sessions/${to}/messages`, {
          from: ME,
          type: "response",
          payload: message,
        });
        if (res.status === 200 || res.status === 201) {
          console.log(`✓ Reply sent to ${to}`);
        } else {
          console.error(`✗ Failed: ${res.body.error || JSON.stringify(res.body)}`);
          process.exit(1);
        }
        break;
      }

      case "list": {
        const sessionId = args[1] || ME;
        if (!sessionId) {
          console.error("Usage: msg list [session-id]");
          process.exit(1);
        }
        const res = await request("GET", `/api/sessions/${sessionId}/messages`);
        const messages = res.body.messages || [];
        if (messages.length === 0) {
          console.log("No pending messages.");
        } else {
          for (const msg of messages) {
            console.log(`[${msg.from}] (${msg.type}): ${msg.payload}`);
          }
        }
        break;
      }

      case "conversation": {
        const peer = args[1];
        if (!ME || !peer) {
          console.error("Usage: msg conversation <peer-session-id>");
          process.exit(1);
        }
        const res = await request("GET", `/api/sessions/${ME}/messages?conversation=${peer}`);
        const messages = res.body.messages || [];
        if (messages.length === 0) {
          console.log(`No conversation with ${peer}.`);
        } else {
          console.log(`Conversation: ${ME} ↔ ${peer} (${messages.length} messages)\n`);
          for (const msg of messages) {
            const dir = msg.from === ME ? "→" : "←";
            console.log(`  ${msg.from} ${dir} ${msg.to}: ${msg.payload}`);
          }
        }
        break;
      }

      case "history": {
        const sessionId = args[1];
        const limit = args[2] || "20";
        if (!sessionId) {
          console.error("Usage: msg history <session-id> [limit]");
          process.exit(1);
        }
        const res = await request("GET", `/api/sessions/${sessionId}/history?limit=${limit}`);
        const entries = res.body.entries || [];
        if (entries.length === 0) {
          console.log("No history entries.");
        } else {
          for (const e of entries) {
            const preview = e.content.substring(0, 120).replace(/\n/g, " ");
            console.log(`[${e.role}] ${preview}${e.content.length > 120 ? "..." : ""}`);
          }
        }
        break;
      }

      case "search": {
        const query = args.slice(1).join(" ");
        if (!query) {
          console.error("Usage: msg search <query>");
          process.exit(1);
        }
        const sessionId = process.env.AO_SESSION_ID || "";
        const projectMatch = sessionId.match(/^([a-zA-Z]+)-/);
        const projectGuess = projectMatch ? projectMatch[1] : "";

        const res = await request("GET", `/api/projects/${projectGuess}/history?query=${encodeURIComponent(query)}&limit=10`);
        const entries = res.body.entries || [];
        if (entries.length === 0) {
          console.log("No results found.");
        } else {
          for (const e of entries) {
            const preview = e.content.substring(0, 120).replace(/\n/g, " ");
            console.log(`[${e.sessionId}/${e.role}] ${preview}${e.content.length > 120 ? "..." : ""}`);
          }
        }
        break;
      }

      case "conv": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        const subCmd = args[1];
        switch (subCmd) {
          case "list": {
            const res = await request("GET", `/api/projects/${PROJECT_ID}/conversations`);
            const convs = res.body.conversations || [];
            if (convs.length === 0) {
              console.log("No conversations.");
            } else {
              for (const c of convs) {
                const members = c.memberIds.join(", ");
                const preview = c.lastMessagePreview ? ` — "${c.lastMessagePreview.substring(0, 60)}"` : "";
                console.log(`  [${c.id.substring(0, 8)}] ${c.type === "dm" ? "DM" : "#" + c.name} (${members})${preview}`);
              }
            }
            break;
          }
          case "create": {
            const name = args[2];
            const memberIds = args.slice(3);
            if (!name || memberIds.length === 0) {
              console.error("Usage: msg conv create <name> <member1> [member2...]");
              process.exit(1);
            }
            // Add self to members if not included
            if (ME && !memberIds.includes(ME)) memberIds.push(ME);
            const res = await request("POST", `/api/projects/${PROJECT_ID}/conversations`, {
              type: "channel", name, memberIds,
            });
            if (res.status === 201) {
              console.log(`✓ Channel "#${name}" created (${res.body.conversation?.id?.substring(0, 8)})`);
            } else {
              console.error(`✗ Failed: ${res.body.error || JSON.stringify(res.body)}`);
            }
            break;
          }
          default:
            console.error(`Unknown conv subcommand: ${subCmd}. Use: list, create`);
            process.exit(1);
        }
        break;
      }

      case "dm": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        // Find or create DM conversation, then send message
        const target = args[1];
        const dmContent = args.slice(2).join(" ");
        if (!target || !dmContent) {
          console.error("Usage: msg dm <target-session-id> <message>");
          process.exit(1);
        }
        // Create DM (API returns existing if one exists)
        const dmConv = await request("POST", `/api/projects/${PROJECT_ID}/conversations`, {
          type: "dm", memberIds: [ME, target],
        });
        if (dmConv.status !== 201 && dmConv.status !== 200) {
          console.error(`✗ Failed to create DM: ${dmConv.body.error}`);
          process.exit(1);
        }
        const convId = dmConv.body.conversation?.id;
        // Send message
        const dmRes = await request("POST", `/api/projects/${PROJECT_ID}/conversations/${convId}/messages`, {
          senderId: ME, senderName: ME, content: dmContent,
        });
        if (dmRes.status === 201) {
          console.log(`✓ DM sent to ${target}`);
        } else {
          console.error(`✗ Failed: ${dmRes.body.error}`);
        }
        break;
      }

      case "chat": {
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        if (!ME) {
          console.error("Error: AO_SESSION_ID is not set");
          process.exit(1);
        }
        const chatConvId = args[1];
        const chatParts = args.slice(2);
        if (!chatConvId || chatParts.length === 0) {
          console.error("Usage: msg chat <conv-id> @agent1 message text here");
          process.exit(1);
        }
        // Parse @mentions from args
        const mentionIds = chatParts.filter(a => a.startsWith("@")).map(a => a.substring(1));
        const chatContent = chatParts.filter(a => !a.startsWith("@")).join(" ");
        const mentionAll = chatParts.some(a => a === "@all");
        const chatRes = await request("POST", `/api/projects/${PROJECT_ID}/conversations/${chatConvId}/messages`, {
          senderId: ME, senderName: ME, content: chatContent,
          mentions: { mentionIds, mentionAll },
        });
        if (chatRes.status === 201) {
          console.log(`✓ Message sent to conversation ${chatConvId.substring(0, 8)}`);
        } else {
          console.error(`✗ Failed: ${chatRes.body.error}`);
        }
        break;
      }

      case "handoff": {
        // Usage: msg handoff @next-agent "description of what was done"
        // Automates: git add + commit + thread post
        if (!PROJECT_ID || !ME) {
          console.error("Error: AO_PROJECT_ID and AO_SESSION_ID must be set");
          process.exit(1);
        }

        const handoffParts = args.slice(1);
        const handoffTags = handoffParts.filter(a => a.startsWith("@")).map(a => a.substring(1));
        const handoffDesc = handoffParts.filter(a => !a.startsWith("@")).join(" ");

        if (handoffTags.length === 0 || !handoffDesc) {
          console.error("Usage: msg handoff @next-agent \"description of changes\"");
          process.exit(1);
        }

        // Step 1: git add + commit
        const { execSync } = require("child_process");
        let commitHash = "";
        try {
          execSync("git add -A", { stdio: "pipe" });
          execSync(`git commit -m "${ME}: ${handoffDesc.replace(/"/g, '\\"')}"`, { stdio: "pipe" });
          commitHash = execSync("git rev-parse --short HEAD", { stdio: "pipe" }).toString().trim();
          console.log(`✓ Committed: ${commitHash}`);
        } catch (err) {
          // Might fail if nothing to commit
          const msg = err.stderr?.toString() || err.message || "";
          if (msg.includes("nothing to commit")) {
            console.log("✓ Nothing new to commit (already up to date)");
            commitHash = execSync("git rev-parse --short HEAD", { stdio: "pipe" }).toString().trim();
          } else {
            console.error("✗ Git commit failed:", msg.substring(0, 200));
            process.exit(1);
          }
        }

        // Step 2: Post to thread
        const handoffContent = `Handoff from ${ME}: ${handoffDesc}. Changes committed as ${commitHash}. Run \`git pull\` before reading files.`;
        const handoffRes = await request("POST", `/api/projects/${PROJECT_ID}/thread`, {
          from: ME,
          tags: handoffTags,
          content: handoffContent,
          groupId: GROUP_ID || undefined,
        });

        if (handoffRes.status === 201) {
          console.log(`✓ Handoff posted to thread (tags: ${handoffTags.map(t => "@" + t).join(" ")})`);
        } else {
          console.error(`✗ Failed to post handoff: ${handoffRes.body.error || JSON.stringify(handoffRes.body)}`);
          process.exit(1);
        }
        break;
      }

      case "pull": {
        // Usage: msg pull — pull latest changes from other agents
        const { execSync: execSyncPull } = require("child_process");
        try {
          const output = execSyncPull("git pull --rebase 2>&1", { stdio: "pipe" }).toString().trim();
          console.log(`✓ ${output}`);
        } catch (err) {
          const msg = err.stderr?.toString() || err.stdout?.toString() || "";
          console.log(`✓ Pull: ${msg.substring(0, 200) || "up to date"}`);
        }
        break;
      }

      case "spawn": {
        // Usage: msg spawn <role> — spawn a child agent in shared workspace
        if (!PROJECT_ID) {
          console.error("Error: AO_PROJECT_ID is not set");
          process.exit(1);
        }
        const spawnRole = args[1];
        if (!spawnRole) {
          console.error("Usage: msg spawn <role> (e.g. gsd-planner, gsd-executor)");
          process.exit(1);
        }
        // Derive groupId: use AO_GROUP_ID if set, otherwise extract from session ID
        const groupId = process.env.AO_GROUP_ID || (ME ? ME.replace(/-[a-z][-a-z]*$/, "") : "");
        if (!groupId) {
          console.error("Error: Cannot determine groupId. AO_GROUP_ID or AO_SESSION_ID must be set.");
          process.exit(1);
        }
        const roleName = spawnRole.startsWith("gsd-") ? spawnRole : `gsd-${spawnRole}`;
        const spawnRes = await request("POST", "/api/spawn", {
          projectId: PROJECT_ID,
          role: roleName,
          groupId: groupId,
        });
        if (spawnRes.status === 201) {
          const s = spawnRes.body.session;
          console.log(`✓ Spawned ${s.id} (${roleName}) in group ${groupId}`);
          console.log(`  Workspace: shared with group ${groupId}`);
        } else {
          console.error(`✗ Failed to spawn: ${spawnRes.body.error || JSON.stringify(spawnRes.body)}`);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${cmd}. Run msg --help for usage.`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
