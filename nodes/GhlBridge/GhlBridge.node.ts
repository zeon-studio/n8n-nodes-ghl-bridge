import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import {
  contactFields,
  contactOperations,
} from "./descriptions/ContactDescription";
import {
  calendarFields,
  calendarOperations,
  conversationFields,
  conversationOperations,
} from "./descriptions/ConversationDescription";
import { formFields, formOperations } from "./descriptions/FormDescription";
import {
  locationFields,
  locationOperations,
} from "./descriptions/LocationDescription";
import {
  opportunityFields,
  opportunityOperations,
} from "./descriptions/OpportunityDescription";
import { userFields, userOperations } from "./descriptions/UserDescription";
import {
  workflowFields,
  workflowOperations,
} from "./descriptions/WorkflowDescription";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const OPERATION_SCOPE_HINTS: Record<string, string[]> = {
  "contact:get": ["contacts.readonly"],
  "contact:getAll": ["contacts.readonly"],
  "contact:search": ["contacts.readonly"],
  "contact:create": ["contacts.write"],
  "contact:upsert": ["contacts.write"],
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
  "calendar:getFreeSlots": ["calendars.readonly"],
  "calendar:bookAppointment": ["calendars/events.write"],
  "calendar:updateAppointment": ["calendars/events.write"],
  "calendar:deleteAppointment": ["calendars/events.write"],

  "form:getAll": ["forms.readonly"],
  "form:getSubmissions": ["forms.readonly"],

  "workflow:getAll": ["workflows.readonly"],
  "workflow:addContact": ["contacts.write"],
  "workflow:removeContact": ["contacts.write"],

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
};

function getScopeHint(resource: string, operation: string): string | undefined {
  const key = `${resource}:${operation}`;
  const scopes = OPERATION_SCOPE_HINTS[key];
  if (!scopes || scopes.length === 0) return undefined;
  return `Possible missing scopes: ${scopes.join(", ")}`;
}

function stringifyErrorParts(serializableError: IDataObject): string {
  const baseMessage = String(serializableError.message ?? "Unknown error");
  const response = serializableError.response;
  if (typeof response === "string") {
    return `${baseMessage} ${response}`;
  }
  if (response && typeof response === "object") {
    const responseObj = response as IDataObject;
    const responseMessage = responseObj.message;
    if (typeof responseMessage === "string") {
      return `${baseMessage} ${responseMessage}`;
    }
  }
  return baseMessage;
}

function toSerializableError(error: unknown): IDataObject {
  const err = error as IDataObject & {
    message?: string;
    statusCode?: number;
    response?: unknown;
  };
  const message =
    typeof err?.message === "string" ? err.message : "Unknown error";
  const statusCode =
    typeof err?.statusCode === "number" ? err.statusCode : undefined;

  let responseBody: unknown;
  if (err?.response && typeof err.response === "object") {
    const response = err.response as IDataObject;
    responseBody = response.body ?? response.data ?? undefined;
  }

  return {
    message,
    ...(statusCode !== undefined ? { statusCode } : {}),
    ...(responseBody !== undefined
      ? { response: responseBody as IDataObject }
      : {}),
  };
}

export class GhlBridge implements INodeType {
  description: INodeTypeDescription = {
    displayName: "GoHighLevel Bridge",
    name: "ghlBridge",
    icon: "file:ghl-bridge.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["resource"] + " • " + $parameter["operation"]}}',
    description: "Consume GoHighLevel API via Token Broker",
    defaults: {
      name: "GHL Bridge",
    },
    codex: {
      alias: ["GHL", "ghl", "HighLevel", "GoHighLevel"],
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
      contactOperations,
      ...contactFields,

      // ── OPPORTUNITY ──────────────────────────────────────────────────────
      opportunityOperations,
      ...opportunityFields,

      // ── CONVERSATION ─────────────────────────────────────────────────────
      conversationOperations,
      ...conversationFields,

      // ── CALENDAR ─────────────────────────────────────────────────────────
      calendarOperations,
      ...calendarFields,

      // ── FORM ─────────────────────────────────────────────────────────────
      formOperations,
      ...formFields,

      // ── WORKFLOW ─────────────────────────────────────────────────────────
      workflowOperations,
      ...workflowFields,

      // ── LOCATION ─────────────────────────────────────────────────────────
      locationOperations,
      ...locationFields,

      // ── USER ─────────────────────────────────────────────────────────────
      userOperations,
      ...userFields,

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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials("ghlBridgeApi");

    const backendUrl = (credentials.baseUrl as string).replace(/\/$/, "");
    const bridgeKey = credentials.bridgeKey as string;
    const locationId = credentials.locationId as string;

    // 1. Fetch short-lived token from Token Broker
    let accessToken: string;
    try {
      const tokenData = await this.helpers.httpRequest({
        method: "GET",
        url: `${backendUrl}/api/v1/token`,
        qs: { bridge_key: bridgeKey, location_id: locationId },
        json: true,
      });
      if (!tokenData?.access_token)
        throw new Error("Token Broker returned invalid token response");
      accessToken = tokenData.access_token as string;
    } catch (error) {
      throw new Error(
        `Failed to fetch access token from Token Broker: ${(error as Error).message}`,
      );
    }

    // 2. Execute per-item logic
    for (let i = 0; i < items.length; i++) {
      let resource = "unknown";
      let operation = "unknown";
      try {
        resource = this.getNodeParameter("resource", i) as string;
        operation = this.getNodeParameter("operation", i) as string;

        let endpoint = "";
        let method: IHttpRequestMethods = "GET";
        let body: IDataObject = {};
        let qs: IDataObject = { locationId };

        // ── CONTACT ───────────────────────────────────────────────────────
        if (resource === "contact") {
          if (operation === "get") {
            const contactId = this.getNodeParameter("contactId", i) as string;
            endpoint = `/contacts/${contactId}`;
            qs = {};
          } else if (operation === "delete") {
            const contactId = this.getNodeParameter("contactId", i) as string;
            endpoint = `/contacts/${contactId}`;
            method = "DELETE";
            qs = {};
          } else if (operation === "getAll") {
            const limit = this.getNodeParameter("limit", i) as number;
            endpoint = "/contacts/";
            qs = { locationId, limit };
          } else if (operation === "search") {
            const query = this.getNodeParameter("query", i) as string;
            endpoint = "/contacts/";
            qs = { locationId, query };
          } else if (operation === "create") {
            endpoint = "/contacts/";
            method = "POST";
            qs = {};
            const firstName = this.getNodeParameter(
              "firstName",
              i,
              "",
            ) as string;
            const lastName = this.getNodeParameter("lastName", i, "") as string;
            const email = this.getNodeParameter("email", i, "") as string;
            const phone = this.getNodeParameter("phone", i, "") as string;
            const additionalFields = this.getNodeParameter(
              "additionalFields",
              i,
              {},
            ) as Record<string, unknown>;
            body = {
              locationId,
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(email && { email }),
              ...(phone && { phone }),
              ...additionalFields,
            };
            if (typeof body.tags === "string" && body.tags) {
              body.tags = (body.tags as string).split(",").map((t) => t.trim());
            }
          } else if (operation === "upsert") {
            endpoint = "/contacts/upsert";
            method = "POST";
            qs = {};
            const firstName = this.getNodeParameter(
              "firstName",
              i,
              "",
            ) as string;
            const lastName = this.getNodeParameter("lastName", i, "") as string;
            const email = this.getNodeParameter("email", i, "") as string;
            const phone = this.getNodeParameter("phone", i, "") as string;
            const additionalFields = this.getNodeParameter(
              "additionalFields",
              i,
              {},
            ) as Record<string, unknown>;
            body = {
              locationId,
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(email && { email }),
              ...(phone && { phone }),
              ...additionalFields,
            };
            if (typeof body.tags === "string" && body.tags) {
              body.tags = (body.tags as string).split(",").map((t) => t.trim());
            }
          } else if (operation === "update") {
            const contactId = this.getNodeParameter("contactId", i) as string;
            endpoint = `/contacts/${contactId}`;
            method = "PUT";
            qs = {};
            const additionalFields = this.getNodeParameter(
              "additionalFields",
              i,
              {},
            ) as IDataObject;
            body = { ...additionalFields };
            if (typeof body.tags === "string" && body.tags) {
              body.tags = (body.tags as string).split(",").map((t) => t.trim());
            }
          } else if (operation === "addTags") {
            const contactId = this.getNodeParameter("contactId", i) as string;
            const tags = (this.getNodeParameter("tags", i) as string)
              .split(",")
              .map((t) => t.trim());
            endpoint = `/contacts/${contactId}/tags`;
            method = "POST";
            qs = {};
            body = { tags };
          } else if (operation === "removeTags") {
            const contactId = this.getNodeParameter("contactId", i) as string;
            const tags = (this.getNodeParameter("tags", i) as string)
              .split(",")
              .map((t) => t.trim());
            endpoint = `/contacts/${contactId}/tags`;
            method = "DELETE";
            qs = {};
            body = { tags };
          }

          // ── OPPORTUNITY ───────────────────────────────────────────────────
        } else if (resource === "opportunity") {
          if (operation === "getPipelines") {
            endpoint = "/opportunities/pipelines";
            qs = { locationId };
          } else if (operation === "get") {
            const opportunityId = this.getNodeParameter(
              "opportunityId",
              i,
            ) as string;
            endpoint = `/opportunities/${opportunityId}`;
            qs = {};
          } else if (operation === "search") {
            const query = this.getNodeParameter("query", i, "") as string;
            const status = this.getNodeParameter("status", i) as string;
            const limit = this.getNodeParameter("limit", i) as number;
            endpoint = "/opportunities/search";
            qs = {
              location_id: locationId,
              ...(query && { q: query }),
              ...(status !== "all" && { status }),
              limit,
            };
          } else if (operation === "create") {
            endpoint = "/opportunities/";
            method = "POST";
            qs = {};
            body = {
              locationId,
              name: this.getNodeParameter("name", i) as string,
              pipelineId: this.getNodeParameter("pipelineId", i) as string,
              pipelineStageId: this.getNodeParameter(
                "pipelineStageId",
                i,
              ) as string,
              contactId: this.getNodeParameter("contactId", i) as string,
              status: this.getNodeParameter("status", i, "open") as string,
              monetaryValue: this.getNodeParameter(
                "monetaryValue",
                i,
                0,
              ) as number,
            };
          } else if (operation === "update") {
            const opportunityId = this.getNodeParameter(
              "opportunityId",
              i,
            ) as string;
            endpoint = `/opportunities/${opportunityId}`;
            method = "PUT";
            qs = {};
            body = {
              pipelineId: this.getNodeParameter("pipelineId", i, "") as string,
              pipelineStageId: this.getNodeParameter(
                "pipelineStageId",
                i,
                "",
              ) as string,
              monetaryValue: this.getNodeParameter(
                "monetaryValue",
                i,
                0,
              ) as number,
            };
          } else if (operation === "updateStatus") {
            const opportunityId = this.getNodeParameter(
              "opportunityId",
              i,
            ) as string;
            endpoint = `/opportunities/${opportunityId}/status`;
            method = "PUT";
            qs = {};
            body = { status: this.getNodeParameter("newStatus", i) as string };
          }

          // ── CONVERSATION ──────────────────────────────────────────────────
        } else if (resource === "conversation") {
          if (operation === "search") {
            const query = this.getNodeParameter("query", i, "") as string;
            const status = this.getNodeParameter("status", i) as string;
            const limit = this.getNodeParameter("limit", i) as number;
            endpoint = "/conversations/search";
            qs = {
              locationId,
              ...(query && { query }),
              ...(status !== "all" && { status }),
              limit,
            };
          } else if (operation === "getMessages") {
            const conversationId = this.getNodeParameter(
              "conversationId",
              i,
            ) as string;
            const limit = this.getNodeParameter("limit", i) as number;
            endpoint = `/conversations/${conversationId}/messages`;
            qs = { limit };
          } else if (operation === "sendSms") {
            endpoint = "/conversations/messages";
            method = "POST";
            qs = {};
            body = {
              type: "SMS",
              contactId: this.getNodeParameter("contactId", i) as string,
              message: this.getNodeParameter("message", i) as string,
            };
          } else if (operation === "sendEmail") {
            endpoint = "/conversations/messages";
            method = "POST";
            qs = {};
            body = {
              type: "Email",
              contactId: this.getNodeParameter("contactId", i) as string,
              subject: this.getNodeParameter("subject", i) as string,
              html: this.getNodeParameter("html", i) as string,
              emailFrom: this.getNodeParameter("emailFrom", i, "") as string,
            };
          }

          // ── CALENDAR ──────────────────────────────────────────────────────
        } else if (resource === "calendar") {
          if (operation === "getEvents") {
            const startDate = this.getNodeParameter("startDate", i) as string;
            const endDate = this.getNodeParameter("endDate", i) as string;
            const calendarId = this.getNodeParameter(
              "calendarId",
              i,
              "",
            ) as string;
            const userId = this.getNodeParameter("userId", i, "") as string;
            const groupId = this.getNodeParameter("groupId", i, "") as string;

            if (!calendarId && !userId && !groupId) {
              throw new Error(
                "One of Calendar ID, User ID, or Group ID is required for Get Events.",
              );
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
          } else if (operation === "getFreeSlots") {
            const calendarId = this.getNodeParameter("calendarId", i) as string;
            const startDate = this.getNodeParameter("startDate", i) as string;
            const endDate = this.getNodeParameter("endDate", i) as string;

            endpoint = `/calendars/${calendarId}/free-slots`;
            qs = {
              startDate: new Date(startDate).getTime(),
              endDate: new Date(endDate).getTime(),
            };
          } else if (operation === "bookAppointment") {
            const calendarId = this.getNodeParameter("calendarId", i) as string;
            const contactId = this.getNodeParameter("contactId", i) as string;
            const startTime = this.getNodeParameter("startTime", i) as string;
            const endTime = this.getNodeParameter("endTime", i, "") as string;
            const title = this.getNodeParameter("title", i, "") as string;
            const appointmentStatus = this.getNodeParameter(
              "appointmentStatus",
              i,
              "new",
            ) as string;

            endpoint = "/calendars/events/appointments";
            method = "POST";
            qs = {};
            body = {
              calendarId,
              locationId,
              contactId,
              startTime: new Date(startTime).toISOString(),
              ...(endTime && { endTime: new Date(endTime).toISOString() }),
              ...(title && { title }),
              appointmentStatus,
            };
          } else if (operation === "updateAppointment") {
            const appointmentId = this.getNodeParameter("appointmentId", i) as string;
            const calendarId = this.getNodeParameter("calendarId", i, "") as string;
            const contactId = this.getNodeParameter("contactId", i, "") as string;
            const startTime = this.getNodeParameter("startTime", i, "") as string;
            const endTime = this.getNodeParameter("endTime", i, "") as string;
            const title = this.getNodeParameter("title", i, "") as string;
            const appointmentStatus = this.getNodeParameter(
              "appointmentStatus",
              i,
              "new"
            ) as string;

            endpoint = `/calendars/events/appointments/${appointmentId}`;
            method = "PUT";
            qs = {};
            body = {
              ...(calendarId && { calendarId }),
              ...(contactId && { contactId }),
              ...(startTime && { startTime: new Date(startTime).toISOString() }),
              ...(endTime && { endTime: new Date(endTime).toISOString() }),
              ...(title && { title }),
              appointmentStatus,
            };
          } else if (operation === "deleteAppointment") {
            const appointmentId = this.getNodeParameter("appointmentId", i) as string;

            endpoint = `/calendars/events/appointments/${appointmentId}`;
            method = "DELETE";
            qs = {};
          }

          // ── FORM ──────────────────────────────────────────────────────────
        } else if (resource === "form") {
          if (operation === "getAll") {
            const limit = this.getNodeParameter("limit", i) as number;
            endpoint = "/forms/";
            qs = { locationId, limit };
          } else if (operation === "getSubmissions") {
            const formId = this.getNodeParameter("formId", i) as string;
            const limit = this.getNodeParameter("limit", i) as number;
            const startAt = this.getNodeParameter("startAt", i, "") as string;
            const endAt = this.getNodeParameter("endAt", i, "") as string;
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
        } else if (resource === "workflow") {
          if (operation === "getAll") {
            endpoint = "/workflows/";
            qs = { locationId };
          } else if (operation === "addContact") {
            const workflowId = this.getNodeParameter("workflowId", i) as string;
            const contactId = this.getNodeParameter("contactId", i) as string;
            endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
            method = "POST";
            qs = {};
            const eventStartTime = this.getNodeParameter(
              "eventStartTime",
              i,
              "",
            ) as string;
            body = {
              ...(eventStartTime && { eventStartTime }),
            };
          } else if (operation === "removeContact") {
            const workflowId = this.getNodeParameter("workflowId", i) as string;
            const contactId = this.getNodeParameter("contactId", i) as string;
            endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
            method = "DELETE";
            qs = {};
            body = {};
          }

          // ── LOCATION ──────────────────────────────────────────────────────
        } else if (resource === "location") {
          if (operation === "get") {
            endpoint = `/locations/${locationId}`;
            qs = {};
          } else if (operation === "getCustomFields") {
            endpoint = `/locations/${locationId}/customFields`;
            qs = {};
          } else if (operation === "createCustomField") {
            endpoint = `/locations/${locationId}/customFields`;
            method = "POST";
            qs = {};
            body = {
              name: this.getNodeParameter("fieldName", i) as string,
              dataType: this.getNodeParameter("dataType", i) as string,
              placeholder: this.getNodeParameter(
                "placeholder",
                i,
                "",
              ) as string,
              ...(this.getNodeParameter("fieldKey", i, "") && {
                fieldKey: this.getNodeParameter("fieldKey", i) as string,
              }),
            };
          } else if (operation === "updateCustomField") {
            const customFieldId = this.getNodeParameter(
              "customFieldId",
              i,
            ) as string;
            endpoint = `/locations/${locationId}/customFields/${customFieldId}`;
            method = "PUT";
            qs = {};
            body = {
              name: this.getNodeParameter("fieldName", i) as string,
              dataType: this.getNodeParameter("dataType", i) as string,
              placeholder: this.getNodeParameter(
                "placeholder",
                i,
                "",
              ) as string,
            };
          } else if (operation === "deleteCustomField") {
            const customFieldId = this.getNodeParameter(
              "customFieldId",
              i,
            ) as string;
            endpoint = `/locations/${locationId}/customFields/${customFieldId}`;
            method = "DELETE";
            qs = {};
          } else if (operation === "getCustomValues") {
            endpoint = `/locations/${locationId}/customValues`;
            qs = {};
          } else if (operation === "createCustomValue") {
            endpoint = `/locations/${locationId}/customValues`;
            method = "POST";
            qs = {};
            body = {
              name: this.getNodeParameter("valueName", i) as string,
              value: this.getNodeParameter("value", i) as string,
            };
          } else if (operation === "updateCustomValue") {
            const customValueId = this.getNodeParameter(
              "customValueId",
              i,
            ) as string;
            endpoint = `/locations/${locationId}/customValues/${customValueId}`;
            method = "PUT";
            qs = {};
            body = {
              name: this.getNodeParameter("valueName", i) as string,
              value: this.getNodeParameter("value", i) as string,
            };
          } else if (operation === "deleteCustomValue") {
            const customValueId = this.getNodeParameter(
              "customValueId",
              i,
            ) as string;
            endpoint = `/locations/${locationId}/customValues/${customValueId}`;
            method = "DELETE";
            qs = {};
          }

          // ── USER ──────────────────────────────────────────────────────────
        } else if (resource === "user") {
          if (operation === "get") {
            const userId = this.getNodeParameter("userId", i) as string;
            endpoint = `/users/${userId}`;
            qs = {};
          } else if (operation === "getAll") {
            endpoint = "/users/";
            qs = { locationId };
          } else if (operation === "getByEmail") {
            const email = this.getNodeParameter("email", i) as string;
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
            const users = (listResponse.users as IDataObject[]) ?? [];
            const matched = users.filter(
              (u) =>
                String(u.email ?? "").toLowerCase() === email.toLowerCase(),
            );
            returnData.push({
              json: {
                users: matched,
                total: matched.length,
              },
              pairedItem: { item: i },
            });
            continue;
          }

          // ── CUSTOM ────────────────────────────────────────────────────────
        } else if (resource === "custom" && operation === "makeRequest") {
          method = this.getNodeParameter("method", i) as IHttpRequestMethods;
          endpoint = this.getNodeParameter("endpoint", i) as string;
          const versionId = this.getNodeParameter("versionId", i) as string;
          qs = {};

          if (["POST", "PUT"].includes(method)) {
            const bodyStr = this.getNodeParameter("bodyJson", i) as string;
            if (bodyStr) body = JSON.parse(bodyStr);
          }
          const qsStr = this.getNodeParameter("queryJson", i) as string;
          if (qsStr) qs = JSON.parse(qsStr);

          // Use custom version header for this resource
          if (endpoint.startsWith("/")) endpoint = endpoint.substring(1);
          const customOptions: IHttpRequestOptions = {
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
        if (endpoint.startsWith("/")) endpoint = endpoint.substring(1);

        const ghlOptions: IHttpRequestOptions = {
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
      } catch (error) {
        const serializable = toSerializableError(error);
        const allErrorText = stringifyErrorParts(serializable).toLowerCase();
        const isScopeDenied =
          serializable.statusCode === 401 &&
          allErrorText.includes("not authorized for this scope");
        const scopeHint = getScopeHint(resource, operation);

        const enhancedError: IDataObject = {
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
        } else {
          const hintSuffix =
            isScopeDenied && scopeHint ? ` | ${scopeHint}` : "";
          throw new Error(
            `${String(serializable.message)}${
              serializable.statusCode !== undefined
                ? ` (status ${String(serializable.statusCode)})`
                : ""
            }${hintSuffix}`,
          );
        }
      }
    }

    return [returnData];
  }
}
