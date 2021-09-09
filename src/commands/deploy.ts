import { Command, flags } from "@oclif/command";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
} from "fs";
import * as tar from "tar";
import { v4 } from "uuid";
import ignore from "ignore";
import { resolve } from "path";
import { promises as fs } from "fs";

const ignoreFile = existsSync(".lunarignore")
  ? readFileSync(".lunarignore").toString()
  : existsSync(".gitignore")
  ? readFileSync(".gitignore").toString()
  : "";
const ig = ignore().add(ignoreFile.split(/\n/g));

function filterFiles(paths: string[]) {
  return ig.filter(paths);
}

export default class Deploy extends Command {
  static description = "Deploy a folder to Lunarbase";

  static examples = [
    `$ lunar deploy -f Dockerfile.example ./context

`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    file: flags.string({
      char: "f",
      description: "Name of the Dockerfile (Default is 'WORKDIR/Dockerfile')",
    }),
  };

  static args = [{ name: "context", default: "." }];

  async run() {
    const { args, flags } = this.parse(Deploy);
    const Dockerfile = readFileSync(flags.file ?? "Dockerfile").toString();
    if (!existsSync(".lunar")) {
      mkdirSync(".lunar");
    }
    this.log(Dockerfile);
    let paths: string[] = [];
    (async () => {
      for await (const f of getFiles(args.context)) {
        paths.push(f);
      }
    })();
    paths = filterFiles(paths);
    const tarStream = tar.Pack();
    for (const path in paths) {
      tarStream.add(createReadStream(path));
    }
    console.log(tarStream.read().toString());
    // await tar.create(
    //   { file: `.lunar/${v4()}.tar.gz` },
    //   [args.context],
    // );
    // const packStream = tar.Pack();
    // packStream.
    // const form = new FormData();
    // form.append()
  }
}


async function* getFiles(dir: string) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}
