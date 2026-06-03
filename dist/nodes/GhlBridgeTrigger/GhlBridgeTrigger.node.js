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
const GHL_TRIGGER_RESOURCES = [
    { name: "Appointment", value: "appointment" },
    { name: "Contact", value: "contact" },
    { name: "Conversation", value: "conversation" },
    { name: "Form", value: "form" },
    { name: "Location", value: "location" },
    { name: "Note", value: "note" },
    { name: "Opportunity", value: "opportunity" },
    { name: "Task", value: "task" },
];
// Used only for multiOptions catalog (no displayOptions on items)
const GHL_ALL_EVENT_OPTIONS = [
    { name: "Appointment Created", value: "AppointmentCreate", action: "On appointment created" },
    { name: "Appointment Updated", value: "AppointmentUpdate", action: "On appointment updated" },
    { name: "Appointment Deleted", value: "AppointmentDelete", action: "On appointment deleted" },
    { name: "Contact Created", value: "ContactCreate", action: "On contact created" },
    { name: "Contact Updated", value: "ContactUpdate", action: "On contact updated" },
    { name: "Contact Deleted", value: "ContactDelete", action: "On contact deleted" },
    { name: "Contact DND Updated", value: "ContactDndUpdate", action: "On contact dnd updated" },
    { name: "Contact Tag Updated", value: "ContactTagUpdate", action: "On contact tag updated" },
    { name: "Contact Merged", value: "ContactMerge", action: "On contact merged" },
    { name: "Contact Birthday", value: "ContactBirthday", action: "On contact birthday" },
    { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate", action: "On conversation unread updated" },
    { name: "Inbound Message", value: "InboundMessage", action: "On inbound message" },
    { name: "Outbound Message", value: "OutboundMessage", action: "On outbound message" },
    { name: "Form Submitted", value: "FormSubmit", action: "On form submitted" },
    { name: "Location Created", value: "LocationCreate", action: "On location created" },
    { name: "Location Updated", value: "LocationUpdate", action: "On location updated" },
    { name: "Location Deleted", value: "LocationDelete", action: "On location deleted" },
    { name: "Note Created", value: "NoteCreate", action: "On note created" },
    { name: "Note Updated", value: "NoteUpdate", action: "On note updated" },
    { name: "Note Deleted", value: "NoteDelete", action: "On note deleted" },
    { name: "Opportunity Created", value: "OpportunityCreate", action: "On opportunity created" },
    { name: "Opportunity Updated", value: "OpportunityUpdate", action: "On opportunity updated" },
    { name: "Opportunity Deleted", value: "OpportunityDelete", action: "On opportunity deleted" },
    { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate", action: "On opportunity status updated" },
    { name: "Opportunity Assigned To Updated", value: "OpportunityAssignedToUpdate", action: "On opportunity assigned to updated" },
    { name: "Opportunity Monetary Value Updated", value: "OpportunityMonetaryValueUpdate", action: "On opportunity monetary value updated" },
    { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate", action: "On opportunity stage updated" },
    { name: "Opportunity Stale", value: "OpportunityStale", action: "On opportunity stale" },
    { name: "Task Created", value: "TaskCreate", action: "On task created" },
    { name: "Task Deleted", value: "TaskDelete", action: "On task deleted" },
    { name: "Task Completed", value: "TaskComplete", action: "On task completed" },
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
            subtitle: '={{$parameter["resource"] + " • " + $parameter["operation"]}}',
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
                // ── TRIGGER MODE ──────────────────────────────────────────────────────
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
                // ── RESOURCE (shown for single + catalog) ─────────────────────────────
                {
                    displayName: "Resource",
                    name: "resource",
                    type: "options",
                    noDataExpression: true,
                    options: GHL_TRIGGER_RESOURCES,
                    default: "contact",
                    displayOptions: {
                        show: {
                            triggerMode: ["single", "catalog"],
                        },
                    },
                    description: "The GoHighLevel resource to listen to",
                },
                // ── OPERATION: Appointment ────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Appointment Created", value: "AppointmentCreate", action: "On appointment created" },
                        { name: "Appointment Updated", value: "AppointmentUpdate", action: "On appointment updated" },
                        { name: "Appointment Deleted", value: "AppointmentDelete", action: "On appointment deleted" },
                    ],
                    default: "AppointmentCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["appointment"],
                        },
                    },
                    description: "The appointment event to listen for",
                },
                // ── OPERATION: Contact ────────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Contact Birthday", value: "ContactBirthday", action: "On contact birthday" },
                        { name: "Contact Created", value: "ContactCreate", action: "On contact created" },
                        { name: "Contact Deleted", value: "ContactDelete", action: "On contact deleted" },
                        { name: "Contact DND Updated", value: "ContactDndUpdate", action: "On contact dnd updated" },
                        { name: "Contact Merged", value: "ContactMerge", action: "On contact merged" },
                        { name: "Contact Tag Updated", value: "ContactTagUpdate", action: "On contact tag updated" },
                        { name: "Contact Updated", value: "ContactUpdate", action: "On contact updated" },
                    ],
                    default: "ContactCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["contact"],
                        },
                    },
                    description: "The contact event to listen for",
                },
                // ── OPERATION: Conversation ───────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate", action: "On conversation unread updated" },
                        { name: "Inbound Message", value: "InboundMessage", action: "On inbound message" },
                        { name: "Outbound Message", value: "OutboundMessage", action: "On outbound message" },
                    ],
                    default: "InboundMessage",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["conversation"],
                        },
                    },
                    description: "The conversation event to listen for",
                },
                // ── OPERATION: Form ───────────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Form Submitted", value: "FormSubmit", action: "On form submitted" },
                    ],
                    default: "FormSubmit",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["form"],
                        },
                    },
                    description: "The form event to listen for",
                },
                // ── OPERATION: Location ───────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Location Created", value: "LocationCreate", action: "On location created" },
                        { name: "Location Updated", value: "LocationUpdate", action: "On location updated" },
                        { name: "Location Deleted", value: "LocationDelete", action: "On location deleted" },
                    ],
                    default: "LocationCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["location"],
                        },
                    },
                    description: "The location event to listen for",
                },
                // ── OPERATION: Note ───────────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Note Created", value: "NoteCreate", action: "On note created" },
                        { name: "Note Deleted", value: "NoteDelete", action: "On note deleted" },
                        { name: "Note Updated", value: "NoteUpdate", action: "On note updated" },
                    ],
                    default: "NoteCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["note"],
                        },
                    },
                    description: "The note event to listen for",
                },
                // ── OPERATION: Opportunity ────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Opportunity Assigned To Updated", value: "OpportunityAssignedToUpdate", action: "On opportunity assigned to updated" },
                        { name: "Opportunity Created", value: "OpportunityCreate", action: "On opportunity created" },
                        { name: "Opportunity Deleted", value: "OpportunityDelete", action: "On opportunity deleted" },
                        { name: "Opportunity Monetary Value Updated", value: "OpportunityMonetaryValueUpdate", action: "On opportunity monetary value updated" },
                        { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate", action: "On opportunity stage updated" },
                        { name: "Opportunity Stale", value: "OpportunityStale", action: "On opportunity stale" },
                        { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate", action: "On opportunity status updated" },
                        { name: "Opportunity Updated", value: "OpportunityUpdate", action: "On opportunity updated" },
                    ],
                    default: "OpportunityCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["opportunity"],
                        },
                    },
                    description: "The opportunity event to listen for",
                },
                // ── OPERATION: Task ───────────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    options: [
                        { name: "Task Completed", value: "TaskComplete", action: "On task completed" },
                        { name: "Task Created", value: "TaskCreate", action: "On task created" },
                        { name: "Task Deleted", value: "TaskDelete", action: "On task deleted" },
                    ],
                    default: "TaskCreate",
                    displayOptions: {
                        show: {
                            triggerMode: ["single"],
                            resource: ["task"],
                        },
                    },
                    description: "The task event to listen for",
                },
                // ── MULTI-SELECT CATALOG ──────────────────────────────────────────────
                {
                    displayName: "Event Types",
                    name: "eventTypesCatalog",
                    type: "multiOptions",
                    options: GHL_ALL_EVENT_OPTIONS,
                    default: [],
                    displayOptions: {
                        show: {
                            triggerMode: ["catalog"],
                        },
                    },
                    description: "Choose multiple known GoHighLevel events",
                },
                // ── MANUAL ────────────────────────────────────────────────────────────
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
                        const operation = this.getNodeParameter("operation");
                        eventTypes = [operation];
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
                        // eslint-disable-next-line @n8n/community-nodes/no-http-request-with-manual-auth
                        const response = await this.helpers.httpRequest(options);
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
                                // eslint-disable-next-line @n8n/community-nodes/no-http-request-with-manual-auth
                                await this.helpers.httpRequest(options);
                            }
                            catch (error) {
                                // eslint-disable-next-line no-console
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
