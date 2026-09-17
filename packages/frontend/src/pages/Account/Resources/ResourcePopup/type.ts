interface IScope {
  id: string;
  value: string;
}

export interface IResourcePopupInput {
  id: string;
  name: string;
  scopes: IScope[];
}
