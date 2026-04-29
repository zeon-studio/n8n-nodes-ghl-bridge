"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarFields = exports.calendarOperations = exports.conversationFields = exports.conversationOperations = void 0;
exports.conversationOperations = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["conversation"] } },
    options: [
        { name: "Search", value: "search", action: "Search conversations" },
        {
            name: "Get Messages",
            value: "getMessages",
            action: "Get messages from a conversation",
        },
        { name: "Send SMS", value: "sendSms", action: "Send an SMS message" },
        { name: "Send Email", value: "sendEmail", action: "Send an email" },
    ],
    default: "search",
};
exports.conversationFields = [
    // ── SEARCH ──────────────────────────────────────────────────────────────
    {
        displayName: "Search Query",
        name: "query",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["search"] },
        },
        description: "Search by contact name or message content",
    },
    {
        displayName: "Status",
        name: "status",
        type: "options",
        options: [
            { name: "All", value: "all" },
            { name: "Read", value: "read" },
            { name: "Unread", value: "unread" },
            { name: "Starred", value: "starred" },
        ],
        default: "all",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["search"] },
        },
    },
    {
        displayName: "Limit",
        name: "limit",
        type: "number",
        default: 20,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
            show: { resource: ["conversation"], operation: ["search"] },
        },
    },
    // ── GET MESSAGES ─────────────────────────────────────────────────────────
    {
        displayName: "Conversation ID",
        name: "conversationId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["getMessages"] },
        },
    },
    {
        displayName: "Message Limit",
        name: "limit",
        type: "number",
        default: 20,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
            show: { resource: ["conversation"], operation: ["getMessages"] },
        },
    },
    // ── SEND SMS ─────────────────────────────────────────────────────────────
    {
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["sendSms", "sendEmail"] },
        },
        description: "The contact to send the message to",
    },
    {
        displayName: "Message",
        name: "message",
        type: "string",
        required: true,
        typeOptions: { rows: 4 },
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["sendSms"] },
        },
    },
    // ── SEND EMAIL ────────────────────────────────────────────────────────────
    {
        displayName: "Subject",
        name: "subject",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["sendEmail"] },
        },
    },
    {
        displayName: "HTML Content",
        name: "html",
        type: "string",
        required: true,
        typeOptions: { rows: 6 },
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["sendEmail"] },
        },
        description: "HTML body of the email",
    },
    {
        displayName: "From Email",
        name: "emailFrom",
        type: "string",
        placeholder: "noreply@example.com",
        default: "",
        displayOptions: {
            show: { resource: ["conversation"], operation: ["sendEmail"] },
        },
    },
];
exports.calendarOperations = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["calendar"] } },
    options: [
        { name: "Get Events", value: "getEvents", action: "Get calendar events" },
    ],
    default: "getEvents",
};
exports.calendarFields = [
    {
        displayName: "Start Date",
        name: "startDate",
        type: "dateTime",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["calendar"], operation: ["getEvents"] },
        },
    },
    {
        displayName: "End Date",
        name: "endDate",
        type: "dateTime",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["calendar"], operation: ["getEvents"] },
        },
    },
    {
        displayName: "Calendar ID (optional)",
        name: "calendarId",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["calendar"], operation: ["getEvents"] },
        },
        description: "Optional. Provide Calendar ID, User ID, or Group ID.",
    },
    {
        displayName: "User ID (optional)",
        name: "userId",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["calendar"], operation: ["getEvents"] },
        },
        description: "Optional. Required if Calendar ID and Group ID are empty.",
    },
    {
        displayName: "Group ID (optional)",
        name: "groupId",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["calendar"], operation: ["getEvents"] },
        },
        description: "Optional. Required if Calendar ID and User ID are empty.",
    },
];
