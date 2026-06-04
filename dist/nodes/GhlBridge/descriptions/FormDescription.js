"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formFields = exports.formOperations = void 0;
exports.formOperations = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["form"] } },
    options: [
        { name: 'Get Many', value: "getAll", action: 'Get many forms' },
        {
            name: "Get Submissions",
            value: "getSubmissions",
            action: "Get submissions for a form",
        },
    ],
    default: "getAll",
};
exports.formFields = [
    // ── GET ALL ─────────────────────────────────────────────────────────────
    {
        displayName: "Limit",
        name: "limit",
        type: "number",
        default: 50,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: { show: { resource: ["form"], operation: ["getAll"] } },
        description: 'Max number of results to return',
    },
    // ── GET SUBMISSIONS ──────────────────────────────────────────────────────
    {
        displayName: "Form ID",
        name: "formId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["form"], operation: ["getSubmissions"] },
        },
        description: "The ID of the form",
    },
    {
        displayName: "Limit",
        name: "limit",
        type: "number",
        default: 50,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
            show: { resource: ["form"], operation: ["getSubmissions"] },
        },
        description: 'Max number of results to return',
    },
    {
        displayName: "Start Date",
        name: "startAt",
        type: "dateTime",
        default: "",
        displayOptions: {
            show: { resource: ["form"], operation: ["getSubmissions"] },
        },
        description: "Filter submissions after this date",
    },
    {
        displayName: "End Date",
        name: "endAt",
        type: "dateTime",
        default: "",
        displayOptions: {
            show: { resource: ["form"], operation: ["getSubmissions"] },
        },
        description: "Filter submissions before this date",
    },
];
