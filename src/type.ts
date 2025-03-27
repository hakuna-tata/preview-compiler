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
  materialDeps: Array<{
    package: string;
    version: string;
    library: string;
    cdnUrl: string;
    debugUrl: string;
  }>;
  usedMaterials: Array<{
    package: string;
    version: string;
    exportName: string;
    isDestruction: boolean;
    exportPath: string;
  }>;
  utilDeps: Array<{
    package: string;
    version: string;
    library: string;
    cdnUrl: string;
    debugUrl: string;
  }>;
  usedUtils: Array<{
    package: string;
    version: string;
    exportName: string;
    isDestruction: boolean;
    exportPath: string;
  }>;
  [key: string]: any;
}