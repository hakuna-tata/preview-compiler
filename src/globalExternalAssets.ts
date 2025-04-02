import { DepType, UsedDepsType } from './type';

export const getExternal = <
  T extends DepType,
  U extends UsedDepsType,
>(
  deps: T[],
  usedDeps: U[],
) => {
  const result: Record<string, { ref: string }> = {};
  for (const usedDep of usedDeps) {
    const dep = deps.find((d) => d.package === usedDep.package && d.version === usedDep.version);

    if (dep) {
      const umdLibraryName = `Compiler_${dep.library}_Debugger`;
      const path = usedDep.isDestruction
        ? `${usedDep.package}${usedDep.exportPath ? `${usedDep.exportPath}` : ''}/${usedDep.exportName}`
        : `${usedDep.package}${usedDep.exportPath ? `${usedDep.exportPath}` : ''}`

      result[path] = { ref: `${umdLibraryName}.${usedDep.exportName}` };
    }
  }

  return result;
};
