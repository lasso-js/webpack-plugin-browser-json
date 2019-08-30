import { loader } from "webpack";
import { getOptions, parseQuery } from "loader-utils";
import normalizeBrowserJson from "./normalize-browser-json";

export default async function(this: loader.LoaderContext, content: string) {
  this.cacheable();
  const { resourceQuery } = this;
  const options = getOptions(this);
  const query =
    resourceQuery && resourceQuery[0] === "?"
      ? parseQuery(this.resourceQuery)
      : {};

  return normalizeBrowserJson({
    flags: options.flags,
    content
  })
    .dependencies.map(toRequire)
    .concat(query.request ? `module.exports = ${toRequire(query.request)}` : [])
    .join("\n");
}

function toRequire(dep: string) {
  return `require(${JSON.stringify(dep)})`;
}
