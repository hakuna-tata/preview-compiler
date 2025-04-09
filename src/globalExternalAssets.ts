import { DepType, UsedDepsType } from './type';

export const getExternal = <
  T extends DepType,
  U extends UsedDepsType,
>(
  deps: T[],
  usedDeps: U[],
) => {
  const result: Record<string, { ref: string }> = {};
  const externalUrls: Array<string> = [];

  for (const usedDep of usedDeps) {
    const dep = deps.find((d) => d.package === usedDep.package && d.version === usedDep.version);

    if (dep) {
      const url = dep.debugUrl ? dep.debugUrl : dep.cdnUrl;
      if (!externalUrls.includes(url)) externalUrls.push(url);
      // const umdLibraryName = `Compiler_${dep.library}_Debugger`;
      const path = `${usedDep.package}${usedDep.exportPath ? `${usedDep.exportPath}` : ''}`;
      
      if (!result[path]) {
        result[path] = {
          ref: usedDep.isDestruction 
            ? `${dep.library}`
            : `${dep.library}.${usedDep.exportName}`
        };
      }
    }
  }

  return { result, externalUrls };
};
