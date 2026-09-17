// Shared shape for a resource-server access grant, attached to both Clients
// and Users: which Resource (by its id/URL) they're allowed to use, and
// which of that resource's scopes they're allowed to request.
export interface IResourceScope {
  id: string;
  scopes: string[];
}
