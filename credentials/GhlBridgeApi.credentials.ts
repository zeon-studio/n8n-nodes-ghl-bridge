import { ICredentialType, INodeProperties } from "n8n-workflow";

export class GhlBridgeApi implements ICredentialType {
  name = "ghlBridgeApi";
  displayName = "GHL Bridge API";
  documentationUrl = "";

  properties: INodeProperties[] = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://hl-n8n.zeon.studio",
      required: true,
      description:
        "The URL of your Token Broker backend (use http://localhost:3000 for local testing)",
    },
    {
      displayName: "Location ID",
      name: "locationId",
      type: "string",
      default: "",
      required: true,
      description:
        "The GoHighLevel Location ID associated with this bridge key",
    },
    {
      displayName: "Bridge Key",
      name: "bridgeKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "The GHL Bridge Key obtained from the dashboard (brk_...)",
    },
  ];
}
