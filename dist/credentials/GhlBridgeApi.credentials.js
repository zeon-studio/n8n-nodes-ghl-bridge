"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhlBridgeApi = void 0;
class GhlBridgeApi {
    constructor() {
        this.name = "ghlBridgeApi";
        this.displayName = "GHL Bridge API";
        this.documentationUrl = "";
        this.properties = [
            {
                displayName: "Base URL",
                name: "baseUrl",
                type: "string",
                default: "https://hl-n8n.zeon.studio",
                required: true,
                description: "The URL of your Token Broker backend (use http://localhost:3000 for local testing)",
            },
            {
                displayName: "Location ID",
                name: "locationId",
                type: "string",
                default: "",
                required: true,
                description: "The GoHighLevel Location ID associated with this bridge key",
            },
            {
                displayName: "Bridge Key",
                name: "bridgeKey",
                type: "string",
                typeOptions: { password: true },
                default: "",
                required: true,
                description: "The GHL Bridge Key obtained from the dashboard (brk_...)",
            },
        ];
    }
}
exports.GhlBridgeApi = GhlBridgeApi;
