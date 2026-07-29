"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhlBridgeApi = void 0;
class GhlBridgeApi {
    constructor() {
        this.name = "ghlBridgeApi";
        this.displayName = "GHL Bridge API";
        this.icon = "file:ghl-bridge.svg";
        this.documentationUrl = "https://www.npmjs.com/package/n8n-nodes-ghl-bridge";
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.bridgeKey}}',
                },
                qs: {
                    bridge_key: '={{$credentials.bridgeKey}}',
                    location_id: '={{$credentials.locationId}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/api/v1/token',
                qs: {
                    bridge_key: '={{$credentials.bridgeKey}}',
                    location_id: '={{$credentials.locationId}}',
                },
            },
        };
    }
}
exports.GhlBridgeApi = GhlBridgeApi;
