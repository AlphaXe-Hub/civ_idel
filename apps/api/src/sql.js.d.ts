declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: (string | number | null)[][];
  }

  export class Statement {
    bind(values: (string | number | null)[] | Record<string, string | number | null>): boolean;
    step(): boolean;
    get(): (string | number | null)[];
    free(): boolean;
    reset(): void;
  }

  export class Database {
    constructor(data?: Buffer | Uint8Array);
    run(sql: string, params?: (string | number | null)[]): void;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export interface InitSqlJsStatic {
    locateFile?: (file: string) => string;
  }

  function initSqlJs(config?: InitSqlJsStatic): Promise<SqlJsStatic>;
  export default initSqlJs;
}
