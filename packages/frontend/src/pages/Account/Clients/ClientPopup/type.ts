interface IRedirectUri {
  id: string;
  value: string;
}

export interface IClientPopupInput {
  clientId: string;
  clientName: string;
  scopes: string[];
  grants: string[];
  redirectUris: IRedirectUri[];
}
