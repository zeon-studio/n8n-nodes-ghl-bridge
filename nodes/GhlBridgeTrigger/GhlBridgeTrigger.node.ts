import * as crypto from "crypto";
import {
  IHookFunctions,
  IHttpRequestOptions,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
  NodeConnectionTypes,
  NodeOperationError,
} from "n8n-workflow";

const GHL_TRIGGER_RESOURCES: INodePropertyOptions[] = [
  { name: "Appointment", value: "appointment" },
  { name: "Contact", value: "contact" },
  { name: "Conversation", value: "conversation" },
  { name: "Location", value: "location" },
  { name: "Note", value: "note" },
  { name: "Opportunity", value: "opportunity" },
  { name: "Task", value: "task" },
];

// Used only for multiOptions catalog (no displayOptions on items)
const GHL_ALL_EVENT_OPTIONS: INodePropertyOptions[] = [
  { name: "Appointment Created", value: "AppointmentCreate", action: "On appointment created" },
  { name: "Appointment Updated", value: "AppointmentUpdate", action: "On appointment updated" },
  { name: "Appointment Deleted", value: "AppointmentDelete", action: "On appointment deleted" },
  { name: "Contact Created", value: "ContactCreate", action: "On contact created" },
  { name: "Contact Updated", value: "ContactUpdate", action: "On contact updated" },
  { name: "Contact Deleted", value: "ContactDelete", action: "On contact deleted" },
  { name: "Contact DND Updated", value: "ContactDndUpdate", action: "On contact dnd updated" },
  { name: "Contact Tag Updated", value: "ContactTagUpdate", action: "On contact tag updated" },
  { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate", action: "On conversation unread updated" },
  { name: "Conversation Updated", value: "ConversationUpdate", action: "On conversation updated" },
  { name: "Inbound Message", value: "InboundMessage", action: "On inbound message" },
  { name: "Outbound Message", value: "OutboundMessage", action: "On outbound message" },
  { name: "Location Created", value: "LocationCreate", action: "On location created" },
  { name: "Location Updated", value: "LocationUpdate", action: "On location updated" },
  { name: "Location Deleted", value: "LocationDelete", action: "On location deleted" },
  { name: "Note Created", value: "NoteCreate", action: "On note created" },
  { name: "Note Updated", value: "NoteUpdate", action: "On note updated" },
  { name: "Note Deleted", value: "NoteDelete", action: "On note deleted" },
  { name: "Opportunity Created", value: "OpportunityCreate", action: "On opportunity created" },
  { name: "Opportunity Updated", value: "OpportunityUpdate", action: "On opportunity updated" },
  { name: "Opportunity Deleted", value: "OpportunityDelete", action: "On opportunity deleted" },
  { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate", action: "On opportunity status updated" },
  { name: "Opportunity Assigned To Updated", value: "OpportunityAssignedToUpdate", action: "On opportunity assigned to updated" },
  { name: "Opportunity Monetary Value Updated", value: "OpportunityMonetaryValueUpdate", action: "On opportunity monetary value updated" },
  { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate", action: "On opportunity stage updated" },
  { name: "Task Created", value: "TaskCreate", action: "On task created" },
  { name: "Task Deleted", value: "TaskDelete", action: "On task deleted" },
  { name: "Task Completed", value: "TaskComplete", action: "On task completed" },
];

function parseManualEventTypes(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    ),
  );
}

export class GhlBridgeTrigger implements INodeType {
  usableAsTool = true;
  description: INodeTypeDescription = {
    displayName: "GoHighLevel Bridge Trigger",
    name: "ghlBridgeTrigger",
    icon: "file:ghl-webhook.svg",
    group: ["trigger"],
    version: 1,
    subtitle:
      '={{ $parameter["triggerMode"] === "single" ? $parameter["resource"] + " • " + $parameter["operation"] : ($parameter["triggerMode"] === "catalog" ? $parameter["resource"] + " • " + ($parameter["eventTypesCatalog"] || []).length + " events" : ($parameter["triggerMode"] === "manual" ? $parameter["eventTypesManual"] : "All events")) }}',
    description: "Triggers on GoHighLevel Webhooks via Token Broker",
    defaults: {
      name: "GHL Bridge Trigger",
    },
    codex: {
      alias: ["GHL", "ghl", "HighLevel", "GoHighLevel", "Webhook"],
    },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: "ghlBridgeApi",
        required: true,
      },
    ],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        responseMode: "onReceived",
        path: "webhook",
      },
    ],
    properties: [
      // ── TRIGGER MODE ──────────────────────────────────────────────────────
      {
        displayName: "Trigger Mode",
        name: "triggerMode",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "All Events",
            value: "all",
            description: "Listen to every event received for this location",
          },
          {
            name: "Manual Event Names",
            value: "manual",
            description:
              "Enter custom event names for events not listed in the catalog",
          },
          {
            name: "Multiple Events",
            value: "catalog",
            description: "Choose multiple known GoHighLevel events",
          },
          {
            name: "Single Event",
            value: "single",
            description: "Listen to a single specific event",
          },
        ],
        default: "single",
        description: "How this trigger should subscribe to GoHighLevel events",
      },

      // ── RESOURCE (shown for single + catalog) ─────────────────────────────
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: GHL_TRIGGER_RESOURCES,
        default: "contact",
        displayOptions: {
          show: {
            triggerMode: ["single", "catalog"],
          },
        },
        description: "The GoHighLevel resource to listen to",
      },

      // ── OPERATION: Appointment ────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Appointment Created", value: "AppointmentCreate", action: "On appointment created" },
          { name: "Appointment Deleted", value: "AppointmentDelete", action: "On appointment deleted" },
          { name: "Appointment Updated", value: "AppointmentUpdate", action: "On appointment updated" },
        ],
        default: "AppointmentCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["appointment"],
          },
        },
        description: "The appointment event to listen for",
      },

      // ── OPERATION: Contact ────────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Contact Created", value: "ContactCreate", action: "On contact created" },
          { name: "Contact Deleted", value: "ContactDelete", action: "On contact deleted" },
          { name: "Contact DND Updated", value: "ContactDndUpdate", action: "On contact dnd updated" },
          { name: "Contact Tag Updated", value: "ContactTagUpdate", action: "On contact tag updated" },
          { name: "Contact Updated", value: "ContactUpdate", action: "On contact updated" },
        ],
        default: "ContactCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["contact"],
          },
        },
        description: "The contact event to listen for",
      },

      // ── OPERATION: Conversation ───────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate", action: "On conversation unread updated" },
          { name: "Conversation Updated", value: "ConversationUpdate", action: "On conversation updated" },
          { name: "Inbound Message", value: "InboundMessage", action: "On inbound message" },
          { name: "Outbound Message", value: "OutboundMessage", action: "On outbound message" },
        ],
        default: "InboundMessage",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["conversation"],
          },
        },
        description: "The conversation event to listen for",
      },

      // ── OPERATION: Location ───────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Location Created", value: "LocationCreate", action: "On location created" },
          { name: "Location Deleted", value: "LocationDelete", action: "On location deleted" },
          { name: "Location Updated", value: "LocationUpdate", action: "On location updated" },
        ],
        default: "LocationCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["location"],
          },
        },
        description: "The location event to listen for",
      },

      // ── OPERATION: Note ───────────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Note Created", value: "NoteCreate", action: "On note created" },
          { name: "Note Deleted", value: "NoteDelete", action: "On note deleted" },
          { name: "Note Updated", value: "NoteUpdate", action: "On note updated" },
        ],
        default: "NoteCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["note"],
          },
        },
        description: "The note event to listen for",
      },

      // ── OPERATION: Opportunity ────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Opportunity Assigned To Updated", value: "OpportunityAssignedToUpdate", action: "On opportunity assigned to updated" },
          { name: "Opportunity Created", value: "OpportunityCreate", action: "On opportunity created" },
          { name: "Opportunity Deleted", value: "OpportunityDelete", action: "On opportunity deleted" },
          { name: "Opportunity Monetary Value Updated", value: "OpportunityMonetaryValueUpdate", action: "On opportunity monetary value updated" },
          { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate", action: "On opportunity stage updated" },
          { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate", action: "On opportunity status updated" },
          { name: "Opportunity Updated", value: "OpportunityUpdate", action: "On opportunity updated" },
        ],
        default: "OpportunityCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["opportunity"],
          },
        },
        description: "The opportunity event to listen for",
      },

      // ── OPERATION: Task ───────────────────────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
								noDataExpression: true,
        options: [
          { name: "Task Completed", value: "TaskComplete", action: "On task completed" },
          { name: "Task Created", value: "TaskCreate", action: "On task created" },
          { name: "Task Deleted", value: "TaskDelete", action: "On task deleted" },
        ],
        default: "TaskCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
            resource: ["task"],
          },
        },
        description: "The task event to listen for",
      },

      // ── MULTI-SELECT CATALOG ──────────────────────────────────────────────
      {
        displayName: "Event Types",
        name: "eventTypesCatalog",
        type: "multiOptions",
        options: GHL_ALL_EVENT_OPTIONS,
        default: [],
        displayOptions: {
          show: {
            triggerMode: ["catalog"],
          },
        },
        description: "Choose multiple known GoHighLevel events",
      },

      // ── MANUAL ────────────────────────────────────────────────────────────
      {
        displayName: "Manual Event Types",
        name: "eventTypesManual",
        type: "string",
        default: "ContactCreate",
        displayOptions: {
          show: {
            triggerMode: ["manual"],
          },
        },
        description: 'Comma-separated event names (e.g. ContactCreate, OpportunityUpdate)',
      },
    ],
		usableAsTool: true,
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Subscriptions we already registered are recorded in the workflow's
        // static data. Reporting them as existing stops n8n from registering a
        // duplicate every time the workflow is republished or n8n restarts.
        const webhookData = this.getWorkflowStaticData("node");
        return (
          Array.isArray(webhookData.subscriptionIds) &&
          webhookData.subscriptionIds.length > 0
        );
      },
      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl("default") as string;
        const webhookData = this.getWorkflowStaticData("node");
        const credentials = await this.getCredentials("ghlBridgeApi");
        const triggerMode = this.getNodeParameter("triggerMode") as
          | "all"
          | "single"
          | "catalog"
          | "manual";
        let eventTypes: string[] = [];

        if (triggerMode === "all") {
          eventTypes = ["*"];
        } else if (triggerMode === "single") {
          const operation = this.getNodeParameter("operation") as string;
          eventTypes = [operation];
        } else if (triggerMode === "catalog") {
          eventTypes = this.getNodeParameter("eventTypesCatalog") as string[];
        } else {
          const manualEventTypes = this.getNodeParameter(
            "eventTypesManual",
          ) as string;
          eventTypes = parseManualEventTypes(manualEventTypes);
        }

        if (eventTypes.length === 0) {
          eventTypes = ["*"];
        }

        const backendUrl = (credentials.baseUrl as string).replace(/\/$/, "");

        if (!webhookData.secret) {
          webhookData.secret = crypto.randomBytes(32).toString("hex");
        }

        const options: IHttpRequestOptions = {
          method: "POST",
          url: `${backendUrl}/api/v1/webhooks/register`,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            webhook_url: webhookUrl,
            event_types: eventTypes,
            secret: webhookData.secret,
          },
          json: true,
        };

        try {
          const response = await this.helpers.httpRequestWithAuthentication.call(
            this,
            "ghlBridgeApi",
            options,
          );
          if (
            response &&
            (response as { subscriptions?: Array<{ id: string }> }).subscriptions &&
            (response as { subscriptions: Array<{ id: string }> }).subscriptions.length > 0
          ) {
            webhookData.subscriptionIds = (
              response as { subscriptions: Array<{ id: string }> }
            ).subscriptions.map((s) => s.id);
          }
          return true;
        } catch (error) {
          throw new NodeOperationError(
            this.getNode(),
            error as Error,
            { message: `Failed to register webhook: ${(error as Error).message}` }
          );
        }
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData("node");
        const credentials = await this.getCredentials("ghlBridgeApi");
        const backendUrl = (credentials.baseUrl as string).replace(/\/$/, "");

        if (
          webhookData.subscriptionIds &&
          Array.isArray(webhookData.subscriptionIds)
        ) {
          for (const subId of webhookData.subscriptionIds) {
            const options: IHttpRequestOptions = {
              method: "DELETE",
              url: `${backendUrl}/api/v1/webhooks/${subId}`,
              json: true,
            };
            try {
              await this.helpers.httpRequestWithAuthentication.call(
                this,
                "ghlBridgeApi",
                options,
              );
            } catch {
              // Silently ignore — webhook may have already been removed
            }
          }
          delete webhookData.subscriptionIds;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const headers = this.getHeaderData();
    const bodyData = this.getBodyData();
    const webhookData = this.getWorkflowStaticData("node");

    if (webhookData.secret) {
      const signature = headers["x-bridge-signature"] as string;
      if (!signature) {
        return {
          webhookResponse: "Missing signature",
        };
      }

      const hmac = crypto.createHmac("sha256", webhookData.secret as string);
      hmac.update(JSON.stringify(bodyData), "utf8");
      const expectedSignature = hmac.digest("hex");

      if (signature !== expectedSignature) {
        return {
          webhookResponse: "Invalid signature",
        };
      }
    }

    return {
      workflowData: [
        [
          {
            json: bodyData,
          },
        ],
      ],
    };
  }
}
