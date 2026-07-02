declare module 'supra-l1-sdk' {
  export class SupraClient {
    constructor(url: string);
    getOracleStoredPrice(pairId: number): Promise<any>;
  }
  export const BCS: any;
}
