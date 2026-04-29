import { INodeProperties } from "n8n-workflow";

// ── LOCATION ─────────────────────────────────────────────────────────────────

export const locationOperations: INodeProperties = {
  displayName: "Operation",
  name: "operation",
  type: "options",
  noDataExpression: true,
  displayOptions: { show: { resource: ["location"] } },
  options: [
    { name: "Get", value: "get", action: "Get location details" },
    // Custom Fields
    {
      name: "Get Custom Fields",
      value: "getCustomFields",
      action: "Get all custom fields",
    },
    {
      name: "Create Custom Field",
      value: "createCustomField",
      action: "Create a custom field",
    },
    {
      name: "Update Custom Field",
      value: "updateCustomField",
      action: "Update a custom field",
    },
    {
      name: "Delete Custom Field",
      value: "deleteCustomField",
      action: "Delete a custom field",
    },
    // Custom Values
    {
      name: "Get Custom Values",
      value: "getCustomValues",
      action: "Get all custom values",
    },
    {
      name: "Create Custom Value",
      value: "createCustomValue",
      action: "Create a custom value",
    },
    {
      name: "Update Custom Value",
      value: "updateCustomValue",
      action: "Update a custom value",
    },
    {
      name: "Delete Custom Value",
      value: "deleteCustomValue",
      action: "Delete a custom value",
    },
  ],
  default: "get",
};

export const locationFields: INodeProperties[] = [
  // ── CUSTOM FIELD ID (shared) ─────────────────────────────────────────────
  {
    displayName: "Custom Field ID",
    name: "customFieldId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["updateCustomField", "deleteCustomField"],
      },
    },
    description: "The ID of the custom field",
  },
  // ── CUSTOM VALUE ID (shared) ─────────────────────────────────────────────
  {
    displayName: "Custom Value ID",
    name: "customValueId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["updateCustomValue", "deleteCustomValue"],
      },
    },
    description: "The ID of the custom value",
  },

  // ── CREATE / UPDATE CUSTOM FIELD ─────────────────────────────────────────
  {
    displayName: "Field Name",
    name: "fieldName",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["createCustomField", "updateCustomField"],
      },
    },
    description: "Display name of the custom field",
  },
  {
    displayName: "Field Key",
    name: "fieldKey",
    type: "string",
    default: "",
    displayOptions: {
      show: { resource: ["location"], operation: ["createCustomField"] },
    },
    description: "Unique key for the field (auto-generated if blank)",
  },
  {
    displayName: "Data Type",
    name: "dataType",
    type: "options",
    options: [
      { name: "Text", value: "TEXT" },
      { name: "Large Text", value: "LARGE_TEXT" },
      { name: "Number", value: "NUMBER" },
      { name: "Phone", value: "PHONE" },
      { name: "Email", value: "EMAIL" },
      { name: "Date", value: "DATE" },
      { name: "Checkbox", value: "CHECKBOX" },
      { name: "Single Options", value: "SINGLE_OPTIONS" },
      { name: "Multiple Options", value: "MULTIPLE_OPTIONS" },
      { name: "Monetary", value: "MONETARY" },
      { name: "URL", value: "URL" },
      { name: "File Upload", value: "FILE_UPLOAD" },
    ],
    default: "TEXT",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["createCustomField", "updateCustomField"],
      },
    },
  },
  {
    displayName: "Placeholder",
    name: "placeholder",
    type: "string",
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["createCustomField", "updateCustomField"],
      },
    },
  },

  // ── CREATE / UPDATE CUSTOM VALUE ─────────────────────────────────────────
  {
    displayName: "Value Name",
    name: "valueName",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["createCustomValue", "updateCustomValue"],
      },
    },
    description: "Display name for the custom value",
  },
  {
    displayName: "Value",
    name: "value",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["location"],
        operation: ["createCustomValue", "updateCustomValue"],
      },
    },
    description: "The actual value string",
  },
];
