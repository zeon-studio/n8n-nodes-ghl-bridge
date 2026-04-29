"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhlBridgeTrigger = void 0;
const crypto = __importStar(require("crypto"));
class GhlBridgeTrigger {
    constructor() {
        this.description = {
            displayName: "GoHighLevel Bridge Trigger (GHL)",
            name: "ghlBridgeTrigger",
            icon: "file:ghl-webhook.svg",
            group: ["trigger"],
            version: 1,
            description: "Triggers on GoHighLevel Webhooks via Token Broker",
            defaults: {
                name: "GHL Bridge Trigger",
            },
            inputs: [],
            outputs: ["main"],
            credentials: [
                {
                    name: "ghlBridgeApi",
                    required: true,
                },
            ],
            webhooks: [
                {
                    name: "default",
                    httpMethod: "POST",
                    responseMode: "onReceived",
                    path: "webhook",
                },
            ],
            properties: [
                {
                    displayName: "Event Types",
                    name: "eventTypes",
                    type: "string",
                    default: "ContactCreate",
                    description: "Comma separated list of events to listen to (e.g. ContactCreate, ContactDelete), or * for all",
                },
            ],
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    // Return false to always recreate for simplicity, or we can fetch subscriptions
                    // Proper implementation would call backend to list subscriptions and check if webhookUrl exists
                    return false;
                },
                async create() {
                    const webhookUrl = this.getNodeWebhookUrl("default");
                    const webhookData = this.getWorkflowStaticData("node");
                    const credentials = await this.getCredentials("ghlBridgeApi");
                    const eventTypesStr = this.getNodeParameter("eventTypes");
                    const eventTypes = eventTypesStr.split(",").map((s) => s.trim());
                    const backendUrl = credentials.baseUrl.replace(/\/$/, "");
                    const bridgeKey = credentials.bridgeKey;
                    // Generate a secret for HMAC if we don't have one
                    if (!webhookData.secret) {
                        webhookData.secret = crypto.randomBytes(32).toString("hex");
                    }
                    const options = {
                        method: "POST",
                        url: `${backendUrl}/api/v1/webhooks/register`,
                        headers: {
                            Authorization: `Bearer ${bridgeKey}`,
                            "Content-Type": "application/json",
                        },
                        body: {
                            webhook_url: webhookUrl,
                            event_types: eventTypes,
                            secret: webhookData.secret,
                        },
                        json: true,
                    };
                    try {
                        const response = await this.helpers.httpRequest(options);
                        // Store the subscription ID so we can delete it later
                        if (response &&
                            response.subscriptions &&
                            response.subscriptions.length > 0) {
                            webhookData.subscriptionIds = response.subscriptions.map((s) => s.id);
                        }
                        return true;
                    }
                    catch (error) {
                        throw new Error(`Failed to register webhook: ${error.message}`);
                    }
                },
                async delete() {
                    const webhookData = this.getWorkflowStaticData("node");
                    const credentials = await this.getCredentials("ghlBridgeApi");
                    const backendUrl = credentials.baseUrl.replace(/\/$/, "");
                    const bridgeKey = credentials.bridgeKey;
                    if (webhookData.subscriptionIds &&
                        Array.isArray(webhookData.subscriptionIds)) {
                        for (const subId of webhookData.subscriptionIds) {
                            const options = {
                                method: "DELETE",
                                url: `${backendUrl}/api/v1/webhooks/${subId}`,
                                headers: {
                                    Authorization: `Bearer ${bridgeKey}`,
                                },
                                json: true,
                            };
                            try {
                                await this.helpers.httpRequest(options);
                            }
                            catch (error) {
                                // Best effort deletion
                                console.warn(`Failed to delete webhook subscription ${subId}: ${error.message}`);
                            }
                        }
                        delete webhookData.subscriptionIds;
                    }
                    return true;
                },
            },
        };
    }
    async webhook() {
        const req = this.getRequestObject();
        const headers = this.getHeaderData();
        const bodyData = this.getBodyData();
        const webhookData = this.getWorkflowStaticData("node");
        // Verify HMAC Signature from the backend
        if (webhookData.secret) {
            const signature = headers["x-bridge-signature"];
            if (!signature) {
                return {
                    webhookResponse: "Missing signature",
                };
            }
            const hmac = crypto.createHmac("sha256", webhookData.secret);
            hmac.update(JSON.stringify(bodyData), "utf8");
            const expectedSignature = hmac.digest("hex");
            if (signature !== expectedSignature) {
                return {
                    webhookResponse: "Invalid signature",
                };
            }
        }
        return {
            workflowData: [
                [
                    {
                        json: bodyData,
                    },
                ],
            ],
        };
    }
}
exports.GhlBridgeTrigger = GhlBridgeTrigger;
