import vm from "vm";
import FlagSet from "./flag-set";
import { BrowserJSON, Dependency, Conditional, Remap } from "./types";

const TYPE_STRING_REG = /^(?:(.+?):\s*)?(.*)$/;
const ALLOWED_TYPES = ["require", "require-run", "package", undefined];

export default function(options: {
  content: string;
  flags: FlagSet;
}): {
  dependencies: string[];
  requireRemap: Remap[];
} {
  const browserJSON = JSON.parse(options.content) as BrowserJSON;
  const shouldKeep = buildConditional(options.flags);
  const getDependencies = (dependencies: BrowserJSON["dependencies"] = []) => {
    return flatten(
      dependencies.map(dependency => {
        const paths: string[] = [];

        if (typeof dependency === "string") {
          const match = dependency.match(TYPE_STRING_REG);

          if (match) {
            const [, type, path] = match;
            dependency = { type, path };
          }
        }

        dependency = dependency as Dependency;

        if (
          !dependency ||
          (dependency.type && ALLOWED_TYPES.indexOf(dependency.type) === -1)
        ) {
          throw new Error(
            `Unable to process "browser.json" file. Dependency "${JSON.stringify(dependency)}" not supported.`
          );
        }

        if (shouldKeep(dependency)) {
          if (dependency.path) {
            paths.push(dependency.path);
          }

          if (dependency.dependencies) {
            paths.push(...getDependencies(dependency.dependencies));
          }
        }

        return paths;
      })
    );
  };

  return {
    requireRemap: (browserJSON.requireRemap || []).filter(shouldKeep),
    dependencies: getDependencies(browserJSON.dependencies)
  };
}

function buildConditional(flags: FlagSet) {
  return function shouldKeep(object: Conditional) {
    return !(
      (object.if &&
        !vm.runInNewContext(object.if, {
          ...global,
          flags,
          extensions: flags
        })) ||
      (object["if-flag"] && !flags.contains(object["if-flag"])) ||
      (object["if-not-flag"] && flags.contains(object["if-not-flag"]))
    );
  };
}

function flatten<T extends unknown[][]>(arr: T): T[0] {
  return [].concat.apply([], arr);
}
