
import { Type } from "@angular/core";
import { LoggerService } from "../services/logger.service";

// Defines the metadata for an MFE component type
export interface Mfe {
  component: Type<any>;
  mfeId: string;
  contract: MfeContract;
}

// Defines the contract that every MFE must adhere to.
export interface MfeContract {
  version: string; // semver string, e.g., '2.1.0'
  eventsSupported: string[]; // e.g., ['user.loggedIn@1', 'layout.setTitle@1']
  dependencies: { [key: string]: string }; // e.g., { '@angular/core': '17.3.0' }
}

// Base class for MFE components to ensure they have an mfeId
export abstract class MfeComponent {
    mfeId!: string;
}

// Manifest structure
export interface MfeManifest {
  [key: string]: {
    stable: MfeManifestEntry;
    canary?: MfeManifestEntry;
  };
}

export interface MfeManifestEntry {
  version: string;
  contractVersion: string;
  bundleUrl: string; // Simulated
  bundleSha256: string; // Simulated
  policies: MfePolicies;
}

export interface MfePolicies {
  perfBudget: {
    lcp: number; // in ms
    bundleSize: number; // in KB
  };
  a11y: {
    minScore: number; // 0-100, or critical violations count
    mode: 'strict' | 'soft';
  };
  security: {
    httpAllowList: string[]; // Allowed API origins
  };
}
