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
const GHL_WEBHOOK_EVENT_OPTIONS = [
    // Appointments (calendars scope)
    { name: "Appointment Created", value: "AppointmentCreate" },
    { name: "Appointment Updated", value: "AppointmentUpdate" },
    { name: "Appointment Deleted", value: "AppointmentDelete" },
    // Contacts (contacts scope)
    { name: "Contact Created", value: "ContactCreate" },
    { name: "Contact Updated", value: "ContactUpdate" },
    { name: "Contact Deleted", value: "ContactDelete" },
    { name: "Contact DND Updated", value: "ContactDndUpdate" },
    { name: "Contact Tag Updated", value: "ContactTagUpdate" },
    { name: "Contact Merged", value: "ContactMerge" },
    { name: "Contact Birthday", value: "ContactBirthday" },
    // Conversations & Messages (conversations + conversations/message scope)
    { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate" },
    { name: "Inbound Message", value: "InboundMessage" },
    { name: "Outbound Message", value: "OutboundMessage" },
    // Locations (locations scope)
    { name: "Location Created", value: "LocationCreate" },
    { name: "Location Updated", value: "LocationUpdate" },
    { name: "Location Deleted", value: "LocationDelete" },
    // Forms (forms scope)
    { name: "Form Submitted", value: "FormSubmit" },
    // Notes (contacts scope)
    { name: "Note Created", value: "NoteCreate" },
    { name: "Note Updated", value: "NoteUpdate" },
    { name: "Note Deleted", value: "NoteDelete" },
    // Opportunities (opportunities scope)
    { name: "Opportunity Created", value: "OpportunityCreate" },
    { name: "Opportunity Updated", value: "OpportunityUpdate" },
    { name: "Opportunity Deleted", value: "OpportunityDelete" },
    { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate" },
    {
        name: "Opportunity Assigned To Updated",
        value: "OpportunityAssignedToUpdate",
    },
    {
        name: "Opportunity Monetary Value Updated",
        value: "OpportunityMonetaryValueUpdate",
    },
    { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate" },
    { name: "Opportunity Stale", value: "OpportunityStale" },
    // Tasks (contacts scope)
    { name: "Task Created", value: "TaskCreate" },
    { name: "Task Deleted", value: "TaskDelete" },
    { name: "Task Completed", value: "TaskComplete" },
];
function parseManualEventTypes(raw) {
    return Array.from(new Set(raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)));
}
class GhlBridgeTrigger {
    constructor() {
        this.description = {
            displayName: "GoHighLevel Bridge Trigger",
            name: "ghlBridgeTrigger",
            icon: "file:ghl-webhook.svg",
            group: ["trigger"],
            version: 1,
            description: "Triggers on GoHighLevel Webhooks via Token Broker",
            defaults: {
                name: "GHL Bridge Trigger",
            },
            codex: {
                alias: ["GHL", "ghl", "HighLevel", "GoHighLevel", "Webhook"],
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
                    displayName: "Trigger Mode",
                    name: "triggerMode",
                    type: "options",
                    noDataExpression: true,
                    options: [
                        {
                            name: "All Events",
                            value: "all",
                            description: "Listen to every event received for this location",
                        },
                        {
                            name: "Single Event",
                            value: "single",
                            description: "Listen to a single specific event",
                        },
                        {
                            name: "Multiple Events",
                            value: "catalog",
                            description: "Choose multiple known GoHighLevel events",
                        },
                        {
                            name: "Manual Event Names",
                            value: "manual",
                            description: "Enter custom event names for events not listed in the catalog",
                        },
                    ],
                    default: "single",
                    description: "How this trigger should subscribe to GoHighLevel events",
                },
                {
                    displayName: "Event",
                    name: "event",
                    type: "options",
                    options: GHL_WEBHOOK_EVENT_OPTIONS,
                    default: "ContactCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                        },
                    },
                    description: "Known GoHighLevel event to subscribe to",
                },
                {
                    displayName: "Event Types",
                    name: "eventTypesCatalog",
                    type: "multiOptions",
                    options: GHL_WEBHOOK_EVENT_OPTIONS,
                    default: ["ContactCreate"],
                    displayOptions: {
                        show: {
                            triggerMode: ["catalog"],
                        },
                    },
                    description: "Known GoHighLevel events to subscribe to",
                },
                {
                    displayName: "Manual Event Types",
                    name: "eventTypesManual",
                    type: "string",
                    default: "ContactCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["manual"],
                        },
                    },
                    description: "Comma separated event names (e.g. ContactCreate, OpportunityUpdate)",
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
                    const triggerMode = this.getNodeParameter("triggerMode");
                    let eventTypes = [];
                    if (triggerMode === "all") {
                        eventTypes = ["*"];
                    }
                    else if (triggerMode === "single") {
                        eventTypes = [this.getNodeParameter("event")];
                    }
                    else if (triggerMode === "catalog") {
                        eventTypes = this.getNodeParameter("eventTypesCatalog");
                    }
                    else {
                        const manualEventTypes = this.getNodeParameter("eventTypesManual");
                        eventTypes = parseManualEventTypes(manualEventTypes);
                    }
                    if (eventTypes.length === 0) {
                        eventTypes = ["*"];
                    }
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
