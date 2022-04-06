import rp from "request-promise";

export class GenericService {
  public static callAPI (method: string, api_path: string, query: Object | null, body: Object | null, headers: Object, json = true){
    return rp({
      url: api_path,
      method,
      json,
      qs:query,
      body,
      headers
    })
  };
}