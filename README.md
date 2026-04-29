# n8n-nodes-ghl-bridge

This is an n8n community node designed to connect n8n workflows with the **GoHighLevel (GHL)** API safely and securely, explicitly designed for public Marketplace Apps. 

Built and maintained by **[Zeon Studio](https://zeon.studio)**.

## Why this Node?

If you are building a **Public Marketplace App** for GoHighLevel, GHL forces you to use OAuth 2.0. Managing these rapid-expiring OAuth tokens directly inside n8n often leads to severe race conditions (i.e., multiple workflows trying to refresh the same token at the same time and permanently invalidating it).

This node relies on a separate centralized **Token Broker Backend** to securely store, refresh, and execute API requests using advisory locks. You simply provide the node with a secure `Bridge Key`, and the Token Broker handles all the OAuth complexity for you automatically!

## Features
- **GHL Bridge (Action Node):** Send completely authenticated API requests to GoHighLevel API v2.
- **GHL Bridge Trigger (Trigger Node):** Receive push webhooks automatically. You just drop the trigger in the canvas, and the Token Broker handles URL registration and payload validation automatically via HMAC signature checks.

## Installation

You can install this node from your n8n Community Nodes interface, or via npm:

```bash
npm install n8n-nodes-ghl-bridge
```

## Setup & Usage
1. You do not need to host anything yourself, the community node automatically connects to the official Token Broker Backend at `hl-n8n.zeon.studio`.
2. Have your clients install your GHL App. They will receive a unique `Bridge Key`.
3. In n8n, create new **GHL Bridge API Credentials**:
   - **Bridge Key:** The unique key provided to the client.
   - **Location ID:** The GHL Location ID.

Once connected, you can build out complete workflows connecting to GHL!

## License

[MIT License](LICENSE) © 2026 Zeon Studio
