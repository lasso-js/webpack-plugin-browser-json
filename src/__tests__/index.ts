import fs from "mz/fs";
import path from "path";
import { BrowserJSONPlugin } from "..";
import { compile } from "./utils/compile";

const FIXTURES = path.join(__dirname, "fixtures");

for (const fixture of fs.readdirSync(FIXTURES)) {
  test(fixture, async () => {
    const fixtureEntry = path.join(FIXTURES, fixture, "index.js");
    const flagsFile = path.join(FIXTURES, fixture, "flags.json");
    const flags = (await fs.exists(flagsFile))
      ? JSON.parse(await fs.readFile(flagsFile, "utf-8"))
      : {};
    await expect(
      compile(fixtureEntry, new BrowserJSONPlugin({ flags }))
    ).resolves.toMatchSnapshot(fixture);
  });
}
