declare module '*.png';
declare module '*.json';

interface Window {
  com: {
    casino: {
      cdn?: string;
      baseCdn?: string;
      barsPath?: string;
      bridgePath?: string;
      bridge?: {
        init: (config: Record<string, unknown>) => void;
      };
    };
  };
}
