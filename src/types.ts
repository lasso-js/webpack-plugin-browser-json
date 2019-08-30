export interface PluginOptions {
  flags?: string[];
}

export interface Dependency extends Conditional {
  path: string;
  url?: never;
  type?: string | undefined;
  external?: never;
  attributes?: never;
  dependencies?: Array<string | Dependency>;
}

export interface Remap extends Conditional {
  from: string;
  to: string;
}

export interface Conditional {
  if?: string;
  "if-flag"?: string;
  "if-not-flag"?: string;
}

export interface BrowserJSON {
  dependencies?: Array<string | Dependency>;
  requireRemap?: Remap[];
}
