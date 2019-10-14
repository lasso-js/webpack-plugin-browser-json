import path from "path";
import { Compiler } from "webpack";
import normalizeBrowserJson from "./normalize-browser-json";
import { PluginOptions } from "./types";
import FlagSet from "./flag-set";

const LOADER = require.resolve("./loader");
const PLUGIN_NAME = "BrowserJSONPlugin";
const BROWSER_JSON = "browser.json";
const BROWSER_JSON_EXTENSION = /[/.]browser\.json$/;

export class BrowserJSONPlugin {
  private _flagSet: FlagSet;
  constructor({ flags = [] }: PluginOptions = {}) {
    this._flagSet = new FlagSet(flags);
  }

  public apply(compiler: Compiler) {
    const { inputFileSystem } = compiler;

    const browserJSONCache: Map<
      string,
      ReturnType<typeof normalizeBrowserJson> | undefined
    > = new Map();

    const tryReadFile = (request: string): Promise<string | undefined> => {
      return new Promise(resolve => {
        inputFileSystem.stat(request, (statErr, stat) => {
          if (statErr || !stat.isFile()) {
            return resolve();
          }

          inputFileSystem.readFile(request, (readErr, buffer) => {
            if (readErr) {
              return resolve();
            }

            resolve(buffer.toString("utf-8"));
          });
        });
      });
    };

    const tryReadBrowserJSON = async (filename: string) => {
      if (browserJSONCache.has(filename)) {
        return browserJSONCache.get(filename);
      }

      const content = await tryReadFile(filename);
      const result = content
        ? normalizeBrowserJson({
            content,
            flags: this._flagSet
          })
        : undefined;
      browserJSONCache.set(filename, result);
      return result;
    };

    if (!compiler.options.module) {
      compiler.options.module = { rules: [] };
    }

    compiler.options.resolve.extensions.push(".browser.json");

    compiler.options.module.rules.push({
      enforce: "pre",
      type: "javascript/auto",
      loader: LOADER,
      test: BROWSER_JSON_EXTENSION,
      options: { flags: this._flagSet }
    });

    compiler.options.module.rules.unshift({
      enforce: "post",
      loader: LOADER,
      test: /(?![./]browser\.json)$/
    });

    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      browserJSONCache.clear();
    });

    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, moduleFactory => {
      const baseResolver = (moduleFactory as any).getResolver("normal");

      const resolveFile = (
        dir: string,
        request: string,
        resolveOptions: any
      ): Promise<string | false> =>
        new Promise((resolve, reject) => {
          baseResolver
            .withOptions(resolveOptions)
            .resolve(
              {},
              dir,
              request,
              {},
              (err: Error | null, result: string | false) =>
                err ? reject(err) : resolve(result)
            );
        });

      // Handle browser.json remaps before webpacks resolver runs.
      moduleFactory.hooks.beforeResolve.tapPromise(
        PLUGIN_NAME,
        async resolveInfo => {
          const {
            request,
            context,
            resolveOptions,
            contextInfo: { issuer }
          } = resolveInfo;

          const [, rawRequest] = /^(?:.*?!)*([^?]+)/.exec(request)!;
          const resource = await resolveFile(
            context,
            rawRequest,
            resolveOptions
          );

          if (resource === false) {
            return;
          }

          resolveInfo.request = request.replace(rawRequest, resource);

          const issuerDir = issuer && path.dirname(issuer);
          const issuerDirBrowserJSONFile =
            issuer && path.join(issuerDir, BROWSER_JSON);

          const resourceDir = path.dirname(resource);
          const resourceDirBrowserJSONFile = path.join(
            resourceDir,
            BROWSER_JSON
          );

          const [
            issuerDirBrowserJSON,
            resourceDirBrowserJSON
          ] = await Promise.all([
            !issuer ? undefined : tryReadBrowserJSON(issuerDirBrowserJSONFile),
            resource === resourceDirBrowserJSONFile
              ? undefined
              : tryReadBrowserJSON(resourceDirBrowserJSONFile)
          ]);

          let resolvedResource = resource;

          if (issuerDirBrowserJSON) {
            for (const remap of issuerDirBrowserJSON.requireRemap) {
              if (
                (await resolveFile(issuerDir, remap.from, resolveOptions)) ===
                resolvedResource
              ) {
                resolvedResource = resolveRelative(remap.to, issuerDir);
                break;
              }
            }
          }

          if (resourceDirBrowserJSON) {
            if (resolvedResource === resource) {
              for (const remap of resourceDirBrowserJSON.requireRemap) {
                if (
                  (await resolveFile(
                    resourceDir,
                    remap.from,
                    resolveOptions
                  )) === resolvedResource
                ) {
                  resolvedResource = resolveRelative(remap.to, resourceDir);
                  break;
                }
              }
            }
          }

          if (resolvedResource !== resource) {
            resolveInfo.request = resolvedResource;
          }
        }
      );
    });
  }
}

function resolveRelative(request: string, from: string) {
  if (request[0] !== ".") {
    return request;
  }

  return path.join(from, request);
}
