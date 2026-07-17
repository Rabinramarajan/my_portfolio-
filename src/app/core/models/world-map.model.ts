/** Client location on world map. */
export interface ClientLocation {
  readonly id: string;
  readonly country: string;
  readonly city?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly clientCount: number;
  readonly projectCount: number;
  readonly industries: string[];
  readonly notableclients?: string[];
}

/** World map configuration. */
export interface WorldMapConfig {
  readonly locations: ClientLocation[];
}
