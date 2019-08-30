import webpack, { Compiler, OutputFileSystem } from "webpack";
import MemoryFS from "memory-fs";
import { BrowserJSONPlugin } from "../..";

export function compile(
  entry: string,
  plugin: BrowserJSONPlugin
): Promise<string> {
  return new Promise((resolve, reject) => {
    const memoryFs = new MemoryFS();
    const compiler = webpack(
      { mode: "none", entry, output: { filename: "file" }, plugins: [plugin] },
      (err, stats) => {
        if (err || stats.hasErrors()) {
          return reject(err || new Error(stats.toString("errors-only")));
        }

        const filePath: string = (stats as any).compilation.assets.file
          .existsAt;
        const fileContent: string = memoryFs.readFileSync(filePath, "utf8");
        const fileContentWithoutBootstrap = fileContent.slice(
          fileContent.indexOf("/* 0 */"),
          fileContent.lastIndexOf("/******/ ])")
        );
        resolve(fileContentWithoutBootstrap);
      }
    ) as Compiler;

    compiler.outputFileSystem = (memoryFs as any) as OutputFileSystem;
  });
}
