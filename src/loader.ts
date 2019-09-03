import { Buffer } from "buffer";
import { loader } from "webpack";
import { getOptions, parseQuery, stringifyRequest } from "loader-utils";
import normalizeBrowserJson from "./normalize-browser-json";

export default async function(this: loader.LoaderContext, content: string) {
  this.cacheable();
  const { resourceQuery } = this;
  const options = getOptions(this);
  const toRequire = (dep: string) => `require(${stringifyRequest(this, dep)})`;
  const query =
    resourceQuery && resourceQuery[0] === "?"
      ? parseQuery(this.resourceQuery)
      : {};

  return normalizeBrowserJson({
    flags: options.flags,
    content
  })
    .dependencies.map(toRequire)
    .concat(query.request ? `module.exports = ${toRequire(Buffer.from(query.request, "hex").toString("utf-8"))}` : [])
    .join("\n");
}
