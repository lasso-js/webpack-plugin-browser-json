import raptorRegexp from "raptor-regexp";

export default class FlagSet {
  private flagList: string[] = [];
  private flagMap: { [x: string]: boolean } = {};
  private key: string | null = null;

  constructor(flags?: string[]) {
    if (flags) {
      this.addAll(flags);
    }
  }

  public isEmpty() {
    return this.flagList.length === 0;
  }

  public add(ext: string) {
    if (Array.isArray(ext)) {
      this.addAll(ext);
      return;
    }

    this.flagMap[ext] = true; // Add the extension to a map for quick lookup
    this.flagList.push(ext); // Maintain an array of flags
    this.key = null; // Clear out the key so that it is regenerated since the collection changed
  }

  public remove(ext: string) {
    if (this.flagMap[ext]) {
      delete this.flagMap[ext];
      this.flagList = Object.keys(this.flagMap);
      this.key = null; // Clear the key since the collection changed
    }
  }

  public addAll(flags: string[] | { [x: string]: any } | FlagSet) {
    if (!flags) {
      return;
    }

    if (flags instanceof FlagSet) {
      flags = flags.flagList;
    }

    if (Array.isArray(flags)) {
      for (const ext of flags) {
        this.add(ext);
      }
    } else if (typeof flags === "object") {
      for (const ext in flags) {
        if (flags.hasOwnProperty(ext)) {
          this.add(ext);
        }
      }
    }
  }

  public getKey() {
    if (this.key == null) {
      this.flagList.sort();
      this.key = this.flagList.join("-");
    }

    return this.key;
  }

  public contains(ext: string) {
    return this.flagMap[ext] === true;
  }

  public containsMatch(ext: string | RegExp) {
    let regExp: RegExp;

    if (ext instanceof RegExp) {
      regExp = ext;
    } else if (ext === "*") {
      return this.flagList.length !== 0;
    } else {
      regExp = raptorRegexp.simple(ext);
    }

    for (const flag of this.flagList) {
      if (regExp.test(flag)) {
        return true;
      }
    }

    return false;
  }

  public getAll() {
    return this.flagList;
  }

  public toString() {
    return this.getKey();
  }
}
