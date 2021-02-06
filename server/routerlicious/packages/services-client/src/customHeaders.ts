/**
 * The ICustomHeadersProvider abstracts the headers fetching mechanism for a host. Host will be responsible for
 * implementing the interfaces.
 */
export interface ICustomHeadersProvider {
    /**
     * Fetches the custom headers from host
     * @returns ICustomHeadersResponse object representing headers value
     */
    fetchCustomHeaders(): Promise<ICustomHeadersResponse>;
}

/**
 * The ICustomHeadersResponse
 */
export interface ICustomHeadersResponse  {
    headers: { [key: string]: string };
}
