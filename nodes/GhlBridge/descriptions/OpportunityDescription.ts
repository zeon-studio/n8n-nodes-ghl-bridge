import { INodeProperties } from "n8n-workflow";

export const opportunityOperations: INodeProperties = {
  displayName: "Operation",
  name: "operation",
  type: "options",
  noDataExpression: true,
  displayOptions: { show: { resource: ["opportunity"] } },
  options: [
    { name: "Create", value: "create", action: "Create an opportunity" },
    { name: "Get", value: "get", action: "Get an opportunity" },
    {
      name: "Get Pipelines",
      value: "getPipelines",
      action: "Get all pipelines",
    },
    { name: "Search", value: "search", action: "Search opportunities" },
    { name: "Update", value: "update", action: "Update an opportunity" },
    {
      name: "Update Status",
      value: "updateStatus",
      action: "Update opportunity status",
    },
  ],
  default: "search",
};

export const opportunityFields: INodeProperties[] = [
  {
    displayName: "Opportunity ID",
    name: "opportunityId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["opportunity"],
        operation: ["get", "update", "updateStatus"],
      },
    },
    description: "The ID of the opportunity",
  },
  // ── SEARCH ──────────────────────────────────────────────────────────────
  {
    displayName: "Search Query",
    name: "query",
    type: "string",
    default: "",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["search"] },
    },
    description: "Search by opportunity name or contact",
  },
  {
    displayName: "Status Filter",
    name: "status",
    type: "options",
    options: [
      { name: "Abandoned", value: "abandoned" },
      { name: "All", value: "all" },
      { name: "Lost", value: "lost" },
      { name: "Open", value: "open" },
      { name: "Won", value: "won" },
    ],
    default: "all",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["search"] },
    },
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "number",
    description: "Max number of results to return",
    default: 50,
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["search"] },
    },
  },
  // ── CREATE ──────────────────────────────────────────────────────────────
  {
    displayName: "Opportunity Name",
    name: "name",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create"] },
    },
  },
  {
    displayName: "Pipeline ID",
    name: "pipelineId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create", "update"] },
    },
    description: 'Get pipeline IDs using "Get Pipelines" operation',
  },
  {
    displayName: "Pipeline Stage ID",
    name: "pipelineStageId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create", "update"] },
    },
  },
  {
    displayName: "Contact ID",
    name: "contactId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create"] },
    },
  },
  {
    displayName: "Status",
    name: "status",
    type: "options",
    options: [
      { name: "Open", value: "open" },
      { name: "Won", value: "won" },
      { name: "Lost", value: "lost" },
      { name: "Abandoned", value: "abandoned" },
    ],
    default: "open",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create"] },
    },
  },
  {
    displayName: "Monetary Value",
    name: "monetaryValue",
    type: "number",
    default: 0,
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["create", "update"] },
    },
  },
  // ── UPDATE STATUS ────────────────────────────────────────────────────────
  {
    displayName: "Status",
    name: "newStatus",
    type: "options",
    options: [
      { name: "Open", value: "open" },
      { name: "Won", value: "won" },
      { name: "Lost", value: "lost" },
      { name: "Abandoned", value: "abandoned" },
    ],
    default: "open",
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["updateStatus"] },
    },
  },
];
