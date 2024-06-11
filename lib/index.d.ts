declare module "mystem3-promise" {
  import { ChildProcess } from "child_process";

  interface MyStemOptions {
    path?: string;
  }

  interface HandlerOptions {
    onlyLemma?: boolean;
    fullAnalysis?: boolean;
  }

  interface MystemAnalysis {
    text: string;
    analysis: Array<{
      lex: string;
      gr: string;
    }>;
  }

  interface Handler {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    word: string;
    onlyLemma?: boolean;
    fullAnalysis?: boolean;
  }

  class MyStem {
    path: string;
    handlers: Handler[];
    mystemProcess?: ChildProcess;

    constructor(args?: MyStemOptions);
    start(): void;
    stop(): void;
    extractAllGrammemes(word: string): Promise<any>;
    lemmatize(word: string): Promise<any>;
    analyze(word: string): Promise<any>;
    private callMyStem(word: string, options?: HandlerOptions): Promise<any>;
    private getGrammemes(data: MystemAnalysis[], options?: HandlerOptions): any;
  }

  export = MyStem;
}
