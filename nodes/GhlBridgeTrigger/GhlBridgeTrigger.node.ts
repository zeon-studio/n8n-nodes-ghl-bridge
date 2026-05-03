import * as crypto from "crypto";
import {
  IHookFunctions,
  IHttpRequestOptions,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from "n8n-workflow";

const GHL_WEBHOOK_EVENT_OPTIONS: INodePropertyOptions[] = [
  // Appointments (calendars scope)
  { name: "Appointment Created", value: "AppointmentCreate" },
  { name: "Appointment Updated", value: "AppointmentUpdate" },
  { name: "Appointment Deleted", value: "AppointmentDelete" },
  // Contacts (contacts scope)
  { name: "Contact Created", value: "ContactCreate" },
  { name: "Contact Updated", value: "ContactUpdate" },
  { name: "Contact Deleted", value: "ContactDelete" },
  { name: "Contact DND Updated", value: "ContactDndUpdate" },
  { name: "Contact Tag Updated", value: "ContactTagUpdate" },
  // Conversations & Messages (conversations + conversations/message scope)
  { name: "Conversation Unread Updated", value: "ConversationUnreadUpdate" },
  { name: "Inbound Message", value: "InboundMessage" },
  { name: "Outbound Message", value: "OutboundMessage" },
  // Locations (locations scope)
  { name: "Location Created", value: "LocationCreate" },
  { name: "Location Updated", value: "LocationUpdate" },
  { name: "Location Deleted", value: "LocationDelete" },
  // Notes (contacts scope)
  { name: "Note Created", value: "NoteCreate" },
  { name: "Note Updated", value: "NoteUpdate" },
  { name: "Note Deleted", value: "NoteDelete" },
  // Opportunities (opportunities scope)
  { name: "Opportunity Created", value: "OpportunityCreate" },
  { name: "Opportunity Updated", value: "OpportunityUpdate" },
  { name: "Opportunity Deleted", value: "OpportunityDelete" },
  { name: "Opportunity Status Updated", value: "OpportunityStatusUpdate" },
  {
    name: "Opportunity Assigned To Updated",
    value: "OpportunityAssignedToUpdate",
  },
  {
    name: "Opportunity Monetary Value Updated",
    value: "OpportunityMonetaryValueUpdate",
  },
  { name: "Opportunity Stage Updated", value: "OpportunityStageUpdate" },
  // Tasks (contacts scope)
  { name: "Task Created", value: "TaskCreate" },
  { name: "Task Deleted", value: "TaskDelete" },
  { name: "Task Completed", value: "TaskComplete" },
  // Users (users scope)
  { name: "User Created", value: "UserCreate" },
  { name: "User Updated", value: "UserUpdate" },
  { name: "User Deleted", value: "UserDelete" },
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
  description: INodeTypeDescription = {
    displayName: "GoHighLevel Bridge Trigger",
    name: "ghlBridgeTrigger",
    icon: "file:ghl-webhook.svg",
    group: ["trigger"],
    version: 1,
    description: "Triggers on GoHighLevel Webhooks via Token Broker",
    defaults: {
      name: "GHL Bridge Trigger",
    },
    codex: {
      alias: ["GHL", "ghl", "HighLevel", "GoHighLevel", "Webhook"],
    },
    inputs: [],
    outputs: ["main"],
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
            name: "Single Event",
            value: "single",
            description: "Listen to a single specific event",
          },
          {
            name: "Multiple Events",
            value: "catalog",
            description: "Choose multiple known GoHighLevel events",
          },
          {
            name: "Manual Event Names",
            value: "manual",
            description:
              "Enter custom event names for events not listed in the catalog",
          },
        ],
        default: "single",
        description: "How this trigger should subscribe to GoHighLevel events",
      },
      {
        displayName: "Event",
        name: "event",
        type: "options",
        options: GHL_WEBHOOK_EVENT_OPTIONS,
        default: "ContactCreate",
        displayOptions: {
          show: {
            triggerMode: ["single"],
          },
        },
        description: "Known GoHighLevel event to subscribe to",
      },
      {
        displayName: "Event Types",
        name: "eventTypesCatalog",
        type: "multiOptions",
        options: GHL_WEBHOOK_EVENT_OPTIONS,
        default: ["ContactCreate"],
        displayOptions: {
          show: {
            triggerMode: ["catalog"],
          },
        },
        description: "Known GoHighLevel events to subscribe to",
      },
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
        description:
          "Comma separated event names (e.g. ContactCreate, OpportunityUpdate)",
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Return false to always recreate for simplicity, or we can fetch subscriptions
        // Proper implementation would call backend to list subscriptions and check if webhookUrl exists
        return false;
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
          eventTypes = [this.getNodeParameter("event") as string];
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
        const bridgeKey = credentials.bridgeKey as string;

        // Generate a secret for HMAC if we don't have one
        if (!webhookData.secret) {
          webhookData.secret = crypto.randomBytes(32).toString("hex");
        }

        const options: IHttpRequestOptions = {
          method: "POST",
          url: `${backendUrl}/api/v1/webhooks/register`,
          headers: {
            Authorization: `Bearer ${bridgeKey}`,
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
          const response = await this.helpers.httpRequest(options);
          // Store the subscription ID so we can delete it later
          if (
            response &&
            response.subscriptions &&
            response.subscriptions.length > 0
          ) {
            webhookData.subscriptionIds = response.subscriptions.map(
              (s: any) => s.id,
            );
          }
          return true;
        } catch (error) {
          throw new Error(
            `Failed to register webhook: ${(error as Error).message}`,
          );
        }
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData("node");
        const credentials = await this.getCredentials("ghlBridgeApi");
        const backendUrl = (credentials.baseUrl as string).replace(/\/$/, "");
        const bridgeKey = credentials.bridgeKey as string;

        if (
          webhookData.subscriptionIds &&
          Array.isArray(webhookData.subscriptionIds)
        ) {
          for (const subId of webhookData.subscriptionIds) {
            const options: IHttpRequestOptions = {
              method: "DELETE",
              url: `${backendUrl}/api/v1/webhooks/${subId}`,
              headers: {
                Authorization: `Bearer ${bridgeKey}`,
              },
              json: true,
            };
            try {
              await this.helpers.httpRequest(options);
            } catch (error) {
              // Best effort deletion
              console.warn(
                `Failed to delete webhook subscription ${subId}: ${(error as Error).message}`,
              );
            }
          }
          delete webhookData.subscriptionIds;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const headers = this.getHeaderData();
    const bodyData = this.getBodyData();
    const webhookData = this.getWorkflowStaticData("node");

    // Verify HMAC Signature from the backend
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
