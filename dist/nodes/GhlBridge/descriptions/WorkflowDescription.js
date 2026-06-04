"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowFields = exports.workflowOperations = void 0;
exports.workflowOperations = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["workflow"] } },
    options: [
        {
            name: "Add Contact to Workflow",
            value: "addContact",
            action: "Add a contact to a workflow",
        },
        { name: 'Get Many', value: "getAll", action: 'Get many workflows' },
        {
            name: 'Remove Contact From Workflow',
            value: "removeContact",
            action: "Remove a contact from a workflow",
        },
    ],
    default: "getAll",
};
exports.workflowFields = [
    // ── ADD / REMOVE CONTACT ─────────────────────────────────────────────────
    {
        displayName: "Workflow ID",
        name: "workflowId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["workflow"],
                operation: ["addContact", "removeContact"],
            },
        },
        description: "The ID of the workflow",
    },
    {
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["workflow"],
                operation: ["addContact", "removeContact"],
            },
        },
        description: "The ID of the contact",
    },
    {
        displayName: "Event Start Time",
        name: "eventStartTime",
        type: "dateTime",
        default: "",
        displayOptions: {
            show: { resource: ["workflow"], operation: ["addContact"] },
        },
        description: "Optional date/time to schedule the workflow trigger",
    },
];
