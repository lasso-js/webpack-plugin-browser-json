import path from "path";
import { loader } from "webpack";
import { getOptions, stringifyRequest } from "loader-utils";
import normalizeBrowserJson from "./normalize-browser-json";
const LOADED_LOOKUP = new WeakMap();

export default function(this: loader.LoaderContext, content: string) {
  const { _module, _compilation } = this;
  const options = getOptions(this);
  const loaded: Set<string> =
    LOADED_LOOKUP.get(_compilation) ||
    LOADED_LOOKUP.set(_compilation, new Set()).get(_compilation);
  this.cacheable();

  if (_module.type !== "javascript/auto") {
    return content;
  }

  if (!options) {
    const resourceDirBrowserJSONFile = path.join(this.context, "browser.json");
    if (loaded.has(resourceDirBrowserJSONFile)) {
      return content;
    }

    const done = this.async();
    return this.fs.stat(resourceDirBrowserJSONFile, (err, stat) => {
      if (err || !stat.isFile()) {
        return done(null, content);
      }

      done(null, `require("./browser.json");${content}`);
    });
  }

  loaded.add(this.resource);
  return normalizeBrowserJson({
    flags: options.flags,
    content
  })
    .dependencies.map(
      (dep: string) => `require(${stringifyRequest(this, dep)})`
    )
    .join("\n");
}
