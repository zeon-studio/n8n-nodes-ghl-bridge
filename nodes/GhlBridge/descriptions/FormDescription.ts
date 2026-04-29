import { INodeProperties } from "n8n-workflow";

export const formOperations: INodeProperties = {
  displayName: "Operation",
  name: "operation",
  type: "options",
  noDataExpression: true,
  displayOptions: { show: { resource: ["form"] } },
  options: [
    { name: "Get All", value: "getAll", action: "Get all forms" },
    {
      name: "Get Submissions",
      value: "getSubmissions",
      action: "Get submissions for a form",
    },
  ],
  default: "getAll",
};

export const formFields: INodeProperties[] = [
  // ── GET ALL ─────────────────────────────────────────────────────────────
  {
    displayName: "Limit",
    name: "limit",
    type: "number",
    default: 20,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: { show: { resource: ["form"], operation: ["getAll"] } },
    description: "Max number of forms to return",
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
    default: 20,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: {
      show: { resource: ["form"], operation: ["getSubmissions"] },
    },
    description: "Max number of submissions to return",
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
