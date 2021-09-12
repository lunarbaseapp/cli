import { Command, flags } from "@oclif/command";
import {
  existsSync,
  mkdirSync,
  readFileSync,
} from "fs";

import { promises } from "fs";
/// @ts-ignore
import { pack } from "tar-pack";
import cli from "cli-ux";
import FormData from "form-data";
import axios from "axios";

interface LunarConfig {
  name: string;
  replicas: number;
  port: number;
  subdomain: string;
  connectedDeploy?: string;
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
    if (!existsSync('.lunarconfig.json')) {
      this.error('.lunarconfig.json not found. (Hint: run \'lunar init\' to create one for you)');
    }
    const Dockerfile = (await promises.readFile(flags.file ?? "Dockerfile")).toString();
    const lunarConfig: LunarConfig = JSON.parse(
      (await promises.readFile(".lunarconfig.json")).toString(),
    );
    // if (!existsSync(".lunar")) {
    //   await promises.mkdir(".lunar");
    // }
    const gzip = pack(args.context, {
      ignoreFiles: [".gitignore", ".lunarignore"],
      fromBase: true,
    });
    const form = new FormData();
    form.append("buildContext", gzip);
    form.append("user", "testuser");
    cli.action.start("Uploading build context");
    const uploadRes = await axios.post(
      "https://cs-0.dev.offline.codes/proxy/3000/uploadContext",
      form,
      {
        headers: form.getHeaders(),
      },
    );
    cli.action.stop();
    if (!uploadRes.data.error) {
      cli.action.start("Initializing builder");
      const createRes = await axios.post(
        "https://cs-0.dev.offline.codes/proxy/3000/createBuilder",
        { ...uploadRes.data, user: "testuser" },
      );
      cli.action.stop();
      if (!createRes.data.error) {
        cli.action.start("Building image");
        const buildRes = await axios.post(
          "https://cs-0.dev.offline.codes/proxy/3000/buildImage",
          {
            ...uploadRes.data,
            ...createRes.data,
            user: "testuser",
          },
        );
        cli.action.stop();
        if (!buildRes.data.error) {
          cli.action.start("Deploying image");
          const connected = await axios.post(
            "https://cs-0.dev.offline.codes/proxy/3000/deployWeb",
            {
              ...lunarConfig,
              user: "testuser",
              image:
                `lunarbasedev.azurecr.io/${createRes.data.imageName}:latest`,
            },
          );
          cli.action.stop();
          console.log(
            `Successfuly deployed ${lunarConfig.name} to https://${lunarConfig.subdomain}.lunarbase.app`,
          );
          promises.writeFile('.lunarconfig.json', JSON.stringify({...lunarConfig, connectedDeploy: connected.data}))
        } else {
          cli.action.stop("failed");
          console.log("Build logs are shown below");
          console.log(buildRes.data.error);
        }
      }
    }
  }
}