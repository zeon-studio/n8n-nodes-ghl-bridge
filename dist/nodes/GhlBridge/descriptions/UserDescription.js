"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFields = exports.userOperations = void 0;
exports.userOperations = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["user"] } },
    options: [
        { name: "Get", value: "get", action: "Get a user by ID" },
        { name: "Get All", value: "getAll", action: "Get all users in a location" },
        {
            name: "Get by Email",
            value: "getByEmail",
            action: "Look up a user by email",
        },
        { name: "Create", value: "create", action: "Create a user" },
        { name: "Update", value: "update", action: "Update a user" },
        { name: "Delete", value: "delete", action: "Delete a user" },
    ],
    default: "getAll",
};
exports.userFields = [
    // ── USER ID (shared) ────────────────────────────────────────────────────
    {
        displayName: "User ID",
        name: "userId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["user"], operation: ["get", "update", "delete"] },
        },
        description: "The ID of the user",
    },
    // ── GET BY EMAIL ─────────────────────────────────────────────────────────
    {
        displayName: "Email",
        name: "email",
        type: "string",
        placeholder: "name@email.com",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["getByEmail"] } },
    },
    // ── CREATE ───────────────────────────────────────────────────────────────
    {
        displayName: "First Name",
        name: "firstName",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    {
        displayName: "Last Name",
        name: "lastName",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    {
        displayName: "Email",
        name: "email",
        type: "string",
        placeholder: "name@email.com",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    {
        displayName: "Password",
        name: "password",
        type: "string",
        typeOptions: { password: true },
        required: true,
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    {
        displayName: "Role",
        name: "role",
        type: "options",
        options: [
            { name: "Admin", value: "admin" },
            { name: "User", value: "user" },
        ],
        default: "user",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    {
        displayName: "Phone",
        name: "phone",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["user"], operation: ["create"] } },
    },
    // ── UPDATE ───────────────────────────────────────────────────────────────
    {
        displayName: "Update Fields",
        name: "updateFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: { show: { resource: ["user"], operation: ["update"] } },
        options: [
            {
                displayName: "First Name",
                name: "firstName",
                type: "string",
                default: "",
            },
            {
                displayName: "Last Name",
                name: "lastName",
                type: "string",
                default: "",
            },
            { displayName: "Email", name: "email", type: "string", default: "" },
            { displayName: "Phone", name: "phone", type: "string", default: "" },
            {
                displayName: "Role",
                name: "role",
                type: "options",
                options: [
                    { name: "Admin", value: "admin" },
                    { name: "User", value: "user" },
                ],
                default: "user",
            },
        ],
    },
];
