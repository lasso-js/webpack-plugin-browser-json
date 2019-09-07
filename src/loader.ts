import { loader } from "webpack";
import { getOptions, stringifyRequest } from "loader-utils";
import normalizeBrowserJson from "./normalize-browser-json";

export default async function(this: loader.LoaderContext, content: string) {
  const options = getOptions(this);
  this.cacheable();

  return normalizeBrowserJson({
    flags: options.flags,
    content
  })
    .dependencies.map(
      (dep: string) => `require(${stringifyRequest(this, dep)})`
    )
    .join("\n");
}
