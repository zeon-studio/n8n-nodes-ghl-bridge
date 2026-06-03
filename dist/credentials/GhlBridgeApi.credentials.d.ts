import { IAuthenticateGeneric, ICredentialType, INodeProperties, ICredentialTestRequest } from "n8n-workflow";
export declare class GhlBridgeApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: "file:ghl-bridge.svg";
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
