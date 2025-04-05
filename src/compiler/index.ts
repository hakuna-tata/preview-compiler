import { transform, availablePresets } from "@babel/standalone";
import { 
  parseDependencies,
  isThirdPartyPackage,
  tryMatchFileWithExtensions,
  resolveRelativePath,
} from './moduleResolver';

interface CompilerOpts {
  fileMap: Record<string, string>;
  moduleName: string;
}

export class Compiler {
  private fileMap: Record<string, string> = {};
  private moduleName: string;

  private compiledModuleMap: Record<string, string> = {};
  private fileVisited = new Set();

  constructor(options: CompilerOpts) {
    this.fileMap = options.fileMap;
    this.moduleName = options.moduleName;
  }

  private compileFile({ filePath, code } : { filePath: string, code: string }) {
    if (filePath.endsWith('.css')) {
      return code;
    }

    return transform(code, {
      presets: ['env', 'react'],
      plugins: ['transform-runtime']
    })?.code as string;
  }

  public buildModuleMap(filePath: string) {
    if (this.fileVisited.has(filePath)) return;
    this.fileVisited.add(filePath);

    const matchedPath = tryMatchFileWithExtensions(filePath, this.fileMap);
    if (!matchedPath) {
      console.error(`不存在 ${filePath} 模块`);
      return;
    }
    const code = this.fileMap[matchedPath];

    const dependencies = parseDependencies({
      filePath: matchedPath,
      code,
    });
    const compiledCode = this.compileFile({ 
      filePath: matchedPath,
      code,
    });

    const depMappings: Record<string, string> = {};
    dependencies.forEach(dep => {
      if (isThirdPartyPackage(dep)) {
        depMappings[dep] = dep;
      } else {
        const resolvedDep = resolveRelativePath(matchedPath, dep);
        this.buildModuleMap(resolvedDep);
      }
    });

    this.compiledModuleMap[matchedPath] = compiledCode;
    return this.compiledModuleMap;
  }
}