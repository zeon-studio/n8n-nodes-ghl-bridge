import { INodeProperties } from "n8n-workflow";

export const userOperations: INodeProperties = {
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
  ],
  default: "getAll",
};

export const userFields: INodeProperties[] = [
  // ── USER ID (shared) ────────────────────────────────────────────────────
  {
    displayName: "User ID",
    name: "userId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: { resource: ["user"], operation: ["get"] },
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
];
