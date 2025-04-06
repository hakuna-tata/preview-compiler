import { 
  transform,
  availablePresets,
  availablePlugins,
} from "@babel/standalone";
import { 
  parseDependencies,
  isThirdPartyPackage,
  tryMatchFileWithExtensions,
  resolveRelativePath,
} from './moduleResolver';
import { processRequireExpression } from './plugins';
import { createRequire } from './polyfill';

interface CompilerOpts {
  fileMap: Record<string, string>;
  entryFilePath: string;
  moduleName: string;
  externals?: Record<string, { ref: string }>;
}

export class Compiler {
  private fileMap: Record<string, string> = {};
  private entryFilePath: string;
  private moduleName: string;
  private externals?: Record<string, { ref: string }>;

  private compiledModuleMap: Record<string, string> = {};
  private fileVisited = new Set();

  constructor(options: CompilerOpts) {
    this.fileMap = options.fileMap;
    this.entryFilePath = options.entryFilePath;
    this.moduleName = options.moduleName;
    this.externals = options.externals;
  }

  private compileFile({ filePath, code } : { filePath: string, code: string }) {
    if (filePath.endsWith('.css')) {
      return code;
    }

    return transform(code, {
      babelrc: false,
      configFile: false,
      presets: [
        availablePresets['env'],
        availablePresets['react']
      ],
      plugins: [
        processRequireExpression,
        availablePlugins['transform-runtime'],
        availablePlugins['syntax-jsx'],
        availablePlugins['proposal-optional-chaining'],
        availablePlugins['proposal-class-properties'],
      ],
    })?.code as string;
  }

  private createModuleWrapper({ filePath, code } : { filePath: string, code: string }) {
    if (filePath.endsWith('.css')) {
      return `(function() {
        const style = document.createElement('style');
        style.textContent = ${JSON.stringify(code)};
        document.head.appendChild(style);
      })`;
    }

    return `(function(__require__, module, exports) {
      ${code}
    })`;
  }

  private buildExecFileMap(filePath: string) {
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

    dependencies.forEach(dep => {
      if (!isThirdPartyPackage(dep)) {
        const resolvedDep = resolveRelativePath(matchedPath, dep);
        this.buildExecFileMap(resolvedDep);
      }
    });

    this.compiledModuleMap[matchedPath] = this.createModuleWrapper({
      filePath: matchedPath,
      code: compiledCode,
    });

    const execFileStr = Object.entries(this.compiledModuleMap).map(([key, value]) => {
      return `['${key}']: ${value}`
    }).join(',\n');
    return `{\n ${execFileStr}\n}`;
  }

  private wrapWithUmd(content: string) {
    return `(function(self, fn) {
      if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = fn();
      } else {
        self['${this.moduleName}'] = fn();
      }
    })(self, function() {
      ${content}
    })
  `;
  }

  public generateBundledCode() {
    const execFileMapStr = this.buildExecFileMap(this.entryFilePath);

    const content =  `(function() {
var __external_ref_map__ = ${JSON.stringify(this.externals || {})};
var __exec_file_map__ = ${execFileMapStr};

var __require__ = ${createRequire()}

var exports = {};
var entryExports = __require__(${this.entryFilePath});
exports.default = entryExports.default || entryExports;

return exports;
})()
    `;

    return this.wrapWithUmd(content);
  }
}