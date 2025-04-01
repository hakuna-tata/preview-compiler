export interface DepType {
  package: string;
  version: string;
  library: string;
  cdnUrl: string;
  debugUrl: string;
}

export interface UsedDepsType {
  package: string;
  version: string;
  exportName: string;
  isDestruction: boolean;
  exportPath: string;
}

export interface Schema {
  name: string;
  version: string;
  dslTree: [{
    sourceCodeMap: Record<string, string>;
    requestList: Array<any>;
    componentName: string;
    props: Record<string, any>; 
    children: Array<{
      componentName: string;
      props: Record<string, any>; 
      [key: string]: any;
    } | undefined>;
    meta?: Record<string, any>;
    [key: string]: any;
  }];
  materialDeps: Array<DepType>;
  usedMaterials: Array<UsedDepsType>;
  utilDeps: Array<DepType>;
  usedUtils: Array<UsedDepsType>;
  [key: string]: any;
}