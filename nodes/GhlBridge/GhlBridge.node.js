"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhlBridge = void 0;
const ContactDescription_1 = require("./descriptions/ContactDescription");
const ConversationDescription_1 = require("./descriptions/ConversationDescription");
const FormDescription_1 = require("./descriptions/FormDescription");
const LocationDescription_1 = require("./descriptions/LocationDescription");
const OpportunityDescription_1 = require("./descriptions/OpportunityDescription");
const UserDescription_1 = require("./descriptions/UserDescription");
const WorkflowDescription_1 = require("./descriptions/WorkflowDescription");
const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const OPERATION_SCOPE_HINTS = {
    "contact:get": ["contacts.readonly"],
    "contact:getAll": ["contacts.readonly"],
    "contact:search": ["contacts.readonly"],
    "contact:create": ["contacts.write"],
    "contact:update": ["contacts.write"],
    "contact:delete": ["contacts.write"],
    "contact:addTags": ["contacts.write"],
    "contact:removeTags": ["contacts.write"],
    "opportunity:get": ["opportunities.readonly"],
    "opportunity:search": ["opportunities.readonly"],
    "opportunity:getPipelines": ["opportunities.readonly"],
    "opportunity:create": ["opportunities.write"],
    "opportunity:update": ["opportunities.write"],
    "opportunity:updateStatus": ["opportunities.write"],
    "conversation:search": ["conversations.readonly"],
    "conversation:getMessages": ["conversations/message.readonly"],
    "conversation:sendSms": ["conversations/message.write"],
    "conversation:sendEmail": ["conversations/message.write"],
    "calendar:getEvents": ["calendars/events.readonly"],
    "form:getAll": ["forms.readonly"],
    "form:getSubmissions": ["forms.readonly"],
    "workflow:getAll": ["workflows.readonly"],
    "workflow:addContact": ["workflows.write"],
    "workflow:removeContact": ["workflows.write"],
    "location:get": ["locations.readonly"],
    "location:getCustomFields": ["locations.readonly"],
    "location:createCustomField": ["locations/customFields.write"],
    "location:updateCustomField": ["locations/customFields.write"],
    "location:deleteCustomField": ["locations/customFields.write"],
    "location:getCustomValues": ["locations/customValues.write"],
    "location:createCustomValue": ["locations/customValues.write"],
    "location:updateCustomValue": ["locations/customValues.write"],
    "location:deleteCustomValue": ["locations/customValues.write"],
    "user:get": ["users.readonly"],
    "user:getAll": ["users.readonly"],
    "user:getByEmail": ["users.readonly"],
    "user:create": ["users.write"],
    "user:update": ["users.write"],
    "user:delete": ["users.write"],
};
function getScopeHint(resource, operation) {
    const key = `${resource}:${operation}`;
    const scopes = OPERATION_SCOPE_HINTS[key];
    if (!scopes || scopes.length === 0)
        return undefined;
    return `Possible missing scopes: ${scopes.join(", ")}`;
}
function stringifyErrorParts(serializableError) {
    var _a;
    const baseMessage = String((_a = serializableError.message) !== null && _a !== void 0 ? _a : "Unknown error");
    const response = serializableError.response;
    if (typeof response === "string") {
        return `${baseMessage} ${response}`;
    }
    if (response && typeof response === "object") {
        const responseObj = response;
        const responseMessage = responseObj.message;
        if (typeof responseMessage === "string") {
            return `${baseMessage} ${responseMessage}`;
        }
    }
    return baseMessage;
}
function toSerializableError(error) {
    var _a, _b;
    const err = error;
    const message = typeof (err === null || err === void 0 ? void 0 : err.message) === "string" ? err.message : "Unknown error";
    const statusCode = typeof (err === null || err === void 0 ? void 0 : err.statusCode) === "number" ? err.statusCode : undefined;
    let responseBody;
    if ((err === null || err === void 0 ? void 0 : err.response) && typeof err.response === "object") {
        const response = err.response;
        responseBody = (_b = (_a = response.body) !== null && _a !== void 0 ? _a : response.data) !== null && _b !== void 0 ? _b : undefined;
    }
    return {
        message,
        ...(statusCode !== undefined ? { statusCode } : {}),
        ...(responseBody !== undefined
            ? { response: responseBody }
            : {}),
    };
}
class GhlBridge {
    constructor() {
        this.description = {
            displayName: "GoHighLevel Bridge (GHL)",
            name: "ghlBridge",
            icon: "file:ghl-bridge.svg",
            group: ["transform"],
            version: 1,
            subtitle: '={{$parameter["resource"] + " • " + $parameter["operation"]}}',
            description: "Consume GoHighLevel API via Token Broker",
            defaults: {
                name: "GHL Bridge",
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: [
                {
                    name: "ghlBridgeApi",
                    required: true,
                },
            ],
            properties: [
                // ── RESOURCE ────────────────────────────────────────────────────────
                {
                    displayName: "Resource",
                    name: "resource",
                    type: "options",
                    noDataExpression: true,
                    options: [
                        { name: "Calendar", value: "calendar" },
                        { name: "Contact", value: "contact" },
                        { name: "Conversation", value: "conversation" },
                        { name: "Custom API Request", value: "custom" },
                        { name: "Form", value: "form" },
                        { name: "Location", value: "location" },
                        { name: "Opportunity", value: "opportunity" },
                        { name: "User", value: "user" },
                        { name: "Workflow", value: "workflow" },
                    ],
                    default: "contact",
                },
                // ── CONTACT ─────────────────────────────────────────────────────────
                ContactDescription_1.contactOperations,
                ...ContactDescription_1.contactFields,
                // ── OPPORTUNITY ──────────────────────────────────────────────────────
                OpportunityDescription_1.opportunityOperations,
                ...OpportunityDescription_1.opportunityFields,
                // ── CONVERSATION ─────────────────────────────────────────────────────
                ConversationDescription_1.conversationOperations,
                ...ConversationDescription_1.conversationFields,
                // ── CALENDAR ─────────────────────────────────────────────────────────
                ConversationDescription_1.calendarOperations,
                ...ConversationDescription_1.calendarFields,
                // ── FORM ─────────────────────────────────────────────────────────────
                FormDescription_1.formOperations,
                ...FormDescription_1.formFields,
                // ── WORKFLOW ─────────────────────────────────────────────────────────
                WorkflowDescription_1.workflowOperations,
                ...WorkflowDescription_1.workflowFields,
                // ── LOCATION ─────────────────────────────────────────────────────────
                LocationDescription_1.locationOperations,
                ...LocationDescription_1.locationFields,
                // ── USER ─────────────────────────────────────────────────────────────
                UserDescription_1.userOperations,
                ...UserDescription_1.userFields,
                // ── CUSTOM ───────────────────────────────────────────────────────────
                {
                    displayName: "Operation",
                    name: "operation",
                    type: "options",
                    noDataExpression: true,
                    displayOptions: { show: { resource: ["custom"] } },
                    options: [
                        {
                            name: "Make Request",
                            value: "makeRequest",
                            description: "Make a custom API request to GoHighLevel (v2 API)",
                        },
                    ],
                    default: "makeRequest",
                },
                {
                    displayName: "Method",
                    name: "method",
                    type: "options",
                    displayOptions: {
                        show: { resource: ["custom"], operation: ["makeRequest"] },
                    },
                    options: [
                        { name: "GET", value: "GET" },
                        { name: "POST", value: "POST" },
                        { name: "PUT", value: "PUT" },
                        { name: "DELETE", value: "DELETE" },
                    ],
                    default: "GET",
                    description: "The HTTP method to use",
                },
                {
                    displayName: "Endpoint",
                    name: "endpoint",
                    type: "string",
                    displayOptions: {
                        show: { resource: ["custom"], operation: ["makeRequest"] },
                    },
                    default: "/contacts/",
                    placeholder: "/contacts/",
                    description: "The endpoint to hit (e.g. /contacts/ or /opportunities/)",
                    required: true,
                },
                {
                    displayName: "Version ID",
                    name: "versionId",
                    type: "string",
                    displayOptions: {
                        show: { resource: ["custom"], operation: ["makeRequest"] },
                    },
                    default: "2021-07-28",
                    required: true,
                    description: "GHL API Version header (e.g., 2021-07-28 or 2021-04-15)",
                },
                {
                    displayName: "Body JSON",
                    name: "bodyJson",
                    type: "json",
                    displayOptions: {
                        show: {
                            resource: ["custom"],
                            operation: ["makeRequest"],
                            method: ["POST", "PUT"],
                        },
                    },
                    default: "{}",
                    description: "The JSON body to send",
                },
                {
                    displayName: "Query Parameters JSON",
                    name: "queryJson",
                    type: "json",
                    displayOptions: {
                        show: { resource: ["custom"], operation: ["makeRequest"] },
                    },
                    default: "{}",
                    description: "Query parameters as JSON object",
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials("ghlBridgeApi");
        const backendUrl = credentials.baseUrl.replace(/\/$/, "");
        const bridgeKey = credentials.bridgeKey;
        const locationId = credentials.locationId;
        // 1. Fetch short-lived token from Token Broker
        let accessToken;
        try {
            const tokenData = await this.helpers.httpRequest({
                method: "GET",
                url: `${backendUrl}/api/v1/token`,
                qs: { bridge_key: bridgeKey, location_id: locationId },
                json: true,
            });
            if (!(tokenData === null || tokenData === void 0 ? void 0 : tokenData.access_token))
                throw new Error("Token Broker returned invalid token response");
            accessToken = tokenData.access_token;
        }
        catch (error) {
            throw new Error(`Failed to fetch access token from Token Broker: ${error.message}`);
        }
        // 2. Execute per-item logic
        for (let i = 0; i < items.length; i++) {
            let resource = "unknown";
            let operation = "unknown";
            try {
                resource = this.getNodeParameter("resource", i);
                operation = this.getNodeParameter("operation", i);
                let endpoint = "";
                let method = "GET";
                let body = {};
                let qs = { locationId };
                // ── CONTACT ───────────────────────────────────────────────────────
                if (resource === "contact") {
                    if (operation === "get") {
                        const contactId = this.getNodeParameter("contactId", i);
                        endpoint = `/contacts/${contactId}`;
                        qs = {};
                    }
                    else if (operation === "delete") {
                        const contactId = this.getNodeParameter("contactId", i);
                        endpoint = `/contacts/${contactId}`;
                        method = "DELETE";
                        qs = {};
                    }
                    else if (operation === "getAll") {
                        const limit = this.getNodeParameter("limit", i);
                        endpoint = "/contacts/";
                        qs = { locationId, limit };
                    }
                    else if (operation === "search") {
                        const query = this.getNodeParameter("query", i);
                        endpoint = "/contacts/";
                        qs = { locationId, query };
                    }
                    else if (operation === "create") {
                        endpoint = "/contacts/";
                        method = "POST";
                        qs = {};
                        const firstName = this.getNodeParameter("firstName", i, "");
                        const lastName = this.getNodeParameter("lastName", i, "");
                        const email = this.getNodeParameter("email", i, "");
                        const phone = this.getNodeParameter("phone", i, "");
                        const additionalFields = this.getNodeParameter("additionalFields", i, {});
                        body = {
                            locationId,
                            ...(firstName && { firstName }),
                            ...(lastName && { lastName }),
                            ...(email && { email }),
                            ...(phone && { phone }),
                            ...additionalFields,
                        };
                        if (typeof body.tags === "string" && body.tags) {
                            body.tags = body.tags.split(",").map((t) => t.trim());
                        }
                    }
                    else if (operation === "update") {
                        const contactId = this.getNodeParameter("contactId", i);
                        endpoint = `/contacts/${contactId}`;
                        method = "PUT";
                        qs = {};
                        const additionalFields = this.getNodeParameter("additionalFields", i, {});
                        body = { ...additionalFields };
                        if (typeof body.tags === "string" && body.tags) {
                            body.tags = body.tags.split(",").map((t) => t.trim());
                        }
                    }
                    else if (operation === "addTags") {
                        const contactId = this.getNodeParameter("contactId", i);
                        const tags = this.getNodeParameter("tags", i)
                            .split(",")
                            .map((t) => t.trim());
                        endpoint = `/contacts/${contactId}/tags`;
                        method = "POST";
                        qs = {};
                        body = { tags };
                    }
                    else if (operation === "removeTags") {
                        const contactId = this.getNodeParameter("contactId", i);
                        const tags = this.getNodeParameter("tags", i)
                            .split(",")
                            .map((t) => t.trim());
                        endpoint = `/contacts/${contactId}/tags`;
                        method = "DELETE";
                        qs = {};
                        body = { tags };
                    }
                    // ── OPPORTUNITY ───────────────────────────────────────────────────
                }
                else if (resource === "opportunity") {
                    if (operation === "getPipelines") {
                        endpoint = "/opportunities/pipelines";
                        qs = { locationId };
                    }
                    else if (operation === "get") {
                        const opportunityId = this.getNodeParameter("opportunityId", i);
                        endpoint = `/opportunities/${opportunityId}`;
                        qs = {};
                    }
                    else if (operation === "search") {
                        const query = this.getNodeParameter("query", i, "");
                        const status = this.getNodeParameter("status", i);
                        const limit = this.getNodeParameter("limit", i);
                        endpoint = "/opportunities/search";
                        qs = {
                            location_id: locationId,
                            ...(query && { q: query }),
                            ...(status !== "all" && { status }),
                            limit,
                        };
                    }
                    else if (operation === "create") {
                        endpoint = "/opportunities/";
                        method = "POST";
                        qs = {};
                        body = {
                            locationId,
                            name: this.getNodeParameter("name", i),
                            pipelineId: this.getNodeParameter("pipelineId", i),
                            pipelineStageId: this.getNodeParameter("pipelineStageId", i),
                            contactId: this.getNodeParameter("contactId", i),
                            status: this.getNodeParameter("status", i, "open"),
                            monetaryValue: this.getNodeParameter("monetaryValue", i, 0),
                        };
                    }
                    else if (operation === "update") {
                        const opportunityId = this.getNodeParameter("opportunityId", i);
                        endpoint = `/opportunities/${opportunityId}`;
                        method = "PUT";
                        qs = {};
                        body = {
                            pipelineId: this.getNodeParameter("pipelineId", i, ""),
                            pipelineStageId: this.getNodeParameter("pipelineStageId", i, ""),
                            monetaryValue: this.getNodeParameter("monetaryValue", i, 0),
                        };
                    }
                    else if (operation === "updateStatus") {
                        const opportunityId = this.getNodeParameter("opportunityId", i);
                        endpoint = `/opportunities/${opportunityId}/status`;
                        method = "PUT";
                        qs = {};
                        body = { status: this.getNodeParameter("newStatus", i) };
                    }
                    // ── CONVERSATION ──────────────────────────────────────────────────
                }
                else if (resource === "conversation") {
                    if (operation === "search") {
                        const query = this.getNodeParameter("query", i, "");
                        const status = this.getNodeParameter("status", i);
                        const limit = this.getNodeParameter("limit", i);
                        endpoint = "/conversations/search";
                        qs = {
                            locationId,
                            ...(query && { query }),
                            ...(status !== "all" && { status }),
                            limit,
                        };
                    }
                    else if (operation === "getMessages") {
                        const conversationId = this.getNodeParameter("conversationId", i);
                        const limit = this.getNodeParameter("limit", i);
                        endpoint = `/conversations/${conversationId}/messages`;
                        qs = { limit };
                    }
                    else if (operation === "sendSms") {
                        endpoint = "/conversations/messages";
                        method = "POST";
                        qs = {};
                        body = {
                            type: "SMS",
                            contactId: this.getNodeParameter("contactId", i),
                            message: this.getNodeParameter("message", i),
                        };
                    }
                    else if (operation === "sendEmail") {
                        endpoint = "/conversations/messages";
                        method = "POST";
                        qs = {};
                        body = {
                            type: "Email",
                            contactId: this.getNodeParameter("contactId", i),
                            subject: this.getNodeParameter("subject", i),
                            html: this.getNodeParameter("html", i),
                            emailFrom: this.getNodeParameter("emailFrom", i, ""),
                        };
                    }
                    // ── CALENDAR ──────────────────────────────────────────────────────
                }
                else if (resource === "calendar") {
                    if (operation === "getEvents") {
                        const startDate = this.getNodeParameter("startDate", i);
                        const endDate = this.getNodeParameter("endDate", i);
                        const calendarId = this.getNodeParameter("calendarId", i, "");
                        const userId = this.getNodeParameter("userId", i, "");
                        const groupId = this.getNodeParameter("groupId", i, "");
                        if (!calendarId && !userId && !groupId) {
                            throw new Error("One of Calendar ID, User ID, or Group ID is required for Get Events.");
                        }
                        endpoint = "/calendars/events";
                        qs = {
                            locationId,
                            startTime: new Date(startDate).getTime(),
                            endTime: new Date(endDate).getTime(),
                            ...(calendarId && { calendarId }),
                            ...(userId && { userId }),
                            ...(groupId && { groupId }),
                        };
                    }
                    // ── FORM ──────────────────────────────────────────────────────────
                }
                else if (resource === "form") {
                    if (operation === "getAll") {
                        const limit = this.getNodeParameter("limit", i);
                        endpoint = "/forms/";
                        qs = { locationId, limit };
                    }
                    else if (operation === "getSubmissions") {
                        const formId = this.getNodeParameter("formId", i);
                        const limit = this.getNodeParameter("limit", i);
                        const startAt = this.getNodeParameter("startAt", i, "");
                        const endAt = this.getNodeParameter("endAt", i, "");
                        endpoint = "/forms/submissions";
                        qs = {
                            formId,
                            locationId,
                            limit,
                            ...(startAt && { startAt }),
                            ...(endAt && { endAt }),
                        };
                    }
                    // ── WORKFLOW ──────────────────────────────────────────────────────
                }
                else if (resource === "workflow") {
                    if (operation === "getAll") {
                        endpoint = "/workflows/";
                        qs = { locationId };
                    }
                    else if (operation === "addContact") {
                        const workflowId = this.getNodeParameter("workflowId", i);
                        const contactId = this.getNodeParameter("contactId", i);
                        endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
                        method = "POST";
                        qs = {};
                        const eventStartTime = this.getNodeParameter("eventStartTime", i, "");
                        body = {
                            ...(eventStartTime && { eventStartTime }),
                        };
                    }
                    else if (operation === "removeContact") {
                        const workflowId = this.getNodeParameter("workflowId", i);
                        const contactId = this.getNodeParameter("contactId", i);
                        endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
                        method = "DELETE";
                        qs = {};
                        body = {};
                    }
                    // ── LOCATION ──────────────────────────────────────────────────────
                }
                else if (resource === "location") {
                    if (operation === "get") {
                        endpoint = `/locations/${locationId}`;
                        qs = {};
                    }
                    else if (operation === "getCustomFields") {
                        endpoint = `/locations/${locationId}/customFields`;
                        qs = {};
                    }
                    else if (operation === "createCustomField") {
                        endpoint = `/locations/${locationId}/customFields`;
                        method = "POST";
                        qs = {};
                        body = {
                            name: this.getNodeParameter("fieldName", i),
                            dataType: this.getNodeParameter("dataType", i),
                            placeholder: this.getNodeParameter("placeholder", i, ""),
                            ...(this.getNodeParameter("fieldKey", i, "") && {
                                fieldKey: this.getNodeParameter("fieldKey", i),
                            }),
                        };
                    }
                    else if (operation === "updateCustomField") {
                        const customFieldId = this.getNodeParameter("customFieldId", i);
                        endpoint = `/locations/${locationId}/customFields/${customFieldId}`;
                        method = "PUT";
                        qs = {};
                        body = {
                            name: this.getNodeParameter("fieldName", i),
                            dataType: this.getNodeParameter("dataType", i),
                            placeholder: this.getNodeParameter("placeholder", i, ""),
                        };
                    }
                    else if (operation === "deleteCustomField") {
                        const customFieldId = this.getNodeParameter("customFieldId", i);
                        endpoint = `/locations/${locationId}/customFields/${customFieldId}`;
                        method = "DELETE";
                        qs = {};
                    }
                    else if (operation === "getCustomValues") {
                        endpoint = `/locations/${locationId}/customValues`;
                        qs = {};
                    }
                    else if (operation === "createCustomValue") {
                        endpoint = `/locations/${locationId}/customValues`;
                        method = "POST";
                        qs = {};
                        body = {
                            name: this.getNodeParameter("valueName", i),
                            value: this.getNodeParameter("value", i),
                        };
                    }
                    else if (operation === "updateCustomValue") {
                        const customValueId = this.getNodeParameter("customValueId", i);
                        endpoint = `/locations/${locationId}/customValues/${customValueId}`;
                        method = "PUT";
                        qs = {};
                        body = {
                            name: this.getNodeParameter("valueName", i),
                            value: this.getNodeParameter("value", i),
                        };
                    }
                    else if (operation === "deleteCustomValue") {
                        const customValueId = this.getNodeParameter("customValueId", i);
                        endpoint = `/locations/${locationId}/customValues/${customValueId}`;
                        method = "DELETE";
                        qs = {};
                    }
                    // ── USER ──────────────────────────────────────────────────────────
                }
                else if (resource === "user") {
                    if (operation === "get") {
                        const userId = this.getNodeParameter("userId", i);
                        endpoint = `/users/${userId}`;
                        qs = {};
                    }
                    else if (operation === "getAll") {
                        endpoint = "/users/";
                        qs = { locationId };
                    }
                    else if (operation === "getByEmail") {
                        const email = this.getNodeParameter("email", i);
                        endpoint = "/users/";
                        qs = { locationId };
                        const listResponse = await this.helpers.httpRequest({
                            method: "GET",
                            url: `${GHL_BASE}${endpoint}`,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                Version: GHL_VERSION,
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            json: true,
                            qs,
                        });
                        const users = (_a = listResponse.users) !== null && _a !== void 0 ? _a : [];
                        const matched = users.filter((u) => { var _a; return String((_a = u.email) !== null && _a !== void 0 ? _a : "").toLowerCase() === email.toLowerCase(); });
                        returnData.push({
                            json: {
                                users: matched,
                                total: matched.length,
                            },
                            pairedItem: { item: i },
                        });
                        continue;
                    }
                    else if (operation === "create") {
                        endpoint = "/users/";
                        method = "POST";
                        qs = {};
                        body = {
                            locationIds: [locationId],
                            firstName: this.getNodeParameter("firstName", i),
                            lastName: this.getNodeParameter("lastName", i),
                            email: this.getNodeParameter("email", i),
                            password: this.getNodeParameter("password", i),
                            role: this.getNodeParameter("role", i),
                            phone: this.getNodeParameter("phone", i, ""),
                        };
                    }
                    else if (operation === "update") {
                        const userId = this.getNodeParameter("userId", i);
                        endpoint = `/users/${userId}`;
                        method = "PUT";
                        qs = {};
                        body = {
                            ...this.getNodeParameter("updateFields", i, {}),
                        };
                    }
                    else if (operation === "delete") {
                        const userId = this.getNodeParameter("userId", i);
                        endpoint = `/users/${userId}`;
                        method = "DELETE";
                        qs = {};
                    }
                    // ── CUSTOM ────────────────────────────────────────────────────────
                }
                else if (resource === "custom" && operation === "makeRequest") {
                    method = this.getNodeParameter("method", i);
                    endpoint = this.getNodeParameter("endpoint", i);
                    const versionId = this.getNodeParameter("versionId", i);
                    qs = {};
                    if (["POST", "PUT"].includes(method)) {
                        const bodyStr = this.getNodeParameter("bodyJson", i);
                        if (bodyStr)
                            body = JSON.parse(bodyStr);
                    }
                    const qsStr = this.getNodeParameter("queryJson", i);
                    if (qsStr)
                        qs = JSON.parse(qsStr);
                    // Use custom version header for this resource
                    if (endpoint.startsWith("/"))
                        endpoint = endpoint.substring(1);
                    const customOptions = {
                        method,
                        url: `${GHL_BASE}/${endpoint}`,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Version: versionId,
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        json: true,
                        ...(Object.keys(qs).length > 0 && { qs }),
                        ...(Object.keys(body).length > 0 &&
                            ["POST", "PUT"].includes(method) && { body }),
                    };
                    const responseData = await this.helpers.httpRequest(customOptions);
                    returnData.push({ json: responseData, pairedItem: { item: i } });
                    continue;
                }
                // Clean endpoint
                if (endpoint.startsWith("/"))
                    endpoint = endpoint.substring(1);
                const ghlOptions = {
                    method,
                    url: `${GHL_BASE}/${endpoint}`,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Version: GHL_VERSION,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    json: true,
                    ...(Object.keys(qs).length > 0 && { qs }),
                    ...(Object.keys(body).length > 0 &&
                        ["POST", "PUT", "DELETE"].includes(method) && { body }),
                };
                const responseData = await this.helpers.httpRequest(ghlOptions);
                returnData.push({ json: responseData, pairedItem: { item: i } });
            }
            catch (error) {
                const serializable = toSerializableError(error);
                const allErrorText = stringifyErrorParts(serializable).toLowerCase();
                const isScopeDenied = serializable.statusCode === 401 &&
                    allErrorText.includes("not authorized for this scope");
                const scopeHint = getScopeHint(resource, operation);
                const enhancedError = {
                    ...serializable,
                    resource,
                    operation,
                    ...(isScopeDenied && scopeHint ? { hint: scopeHint } : {}),
                };
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: enhancedError },
                        pairedItem: { item: i },
                    });
                }
                else {
                    const hintSuffix = isScopeDenied && scopeHint ? ` | ${scopeHint}` : "";
                    throw new Error(`${String(serializable.message)}${serializable.statusCode !== undefined
                        ? ` (status ${String(serializable.statusCode)})`
                        : ""}${hintSuffix}`);
                }
            }
        }
        return [returnData];
    }
}
exports.GhlBridge = GhlBridge;
