import { Schema } from './type';

export const getExternal = <
  T extends { package: string; version: string },
  U extends { package: string; version: string },
>(
  deps: T[],
  usedDeps: U[],
) => {
  const result: string[] = [];
  for (const usedDep of usedDeps) {
    const dep = deps.find((d) => d.package === usedDep.package && d.version === usedDep.version);

    if (dep) {

    }
  }

  return result.join('\n');
};
