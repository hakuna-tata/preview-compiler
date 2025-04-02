interface CompilerOpts {
  fileMap: Record<string, string>;
  entryFile: string;
  moduleName: string;
}

export class Compiler {
  private fileMap: Record<string, string> = {};

  private entryFile: string;

  private moduleName: string;
  
  constructor(options: CompilerOpts) {
    this.fileMap = options.fileMap;
    this.entryFile = options.entryFile;
    this.moduleName = options.moduleName;
  }

  public compiler() {
    return '';
  }
}