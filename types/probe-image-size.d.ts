declare module "probe-image-size" {
  interface ProbeResult {
    width: number;
    height: number;
    type: string;
    mime: string;
    wUnits: string;
    hUnits: string;
    url?: string;
  }

  interface ProbeOptions {
    retries?: number;
    timeout?: number;
  }

  function probe(input: NodeJS.ReadableStream): Promise<ProbeResult>;
  function probe(input: NodeJS.ReadableStream, callback: (err: Error | null, result: ProbeResult) => void): void;

  export = probe;
}