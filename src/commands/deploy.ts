import { Command, flags } from "@oclif/command";
import { existsSync, mkdirSync, readFileSync } from "fs";

import { promises } from "fs";
/// @ts-ignore
import { pack } from "tar-pack";
import cli from "cli-ux";
import FormData from "form-data";
import axios from "axios";
import { WSClient } from "../wsClient";
import { UploadContextResponse } from "../interfaces/UploadContextResponse";
import { LunarResponse } from "../interfaces/LunarResponse";
import { IsLog } from "../interfaces/IsLog";

interface LunarConfig {
  token: string;
  name: string;
  replicas: number;
  port: number;
  subdomain: string;
  connectedDeploy?: string;
  projectId: string;
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
    if (!existsSync(".lunarconfig.json")) {
      this.error(
        ".lunarconfig.json not found. (Hint: run 'lunar init' to create one for you)",
      );
    }
    const Dockerfile = (await promises.readFile(flags.file ?? "Dockerfile"))
      .toString();
    const lunarConfig: LunarConfig = JSON.parse(
      (await promises.readFile(".lunarconfig.json")).toString(),
    );
    const gzip = pack(args.context, {
      ignoreFiles: [".gitignore", ".lunarignore"],
      fromBase: true,
    });
    const form = new FormData();
    form.append("buildContext", gzip);
    form.append("user", "testuser");
    cli.action.start("Uploading build context");
    const uploadRes = await axios.post<LunarResponse<UploadContextResponse>>(
      "https://cs-0.dev.offline.codes/proxy/5000/uploadContext",
      form,
      {
        headers: { Authorization: lunarConfig.token, ...form.getHeaders() },
      },
    );
    cli.action.stop();
    if (uploadRes.data.success) {
      const client = new WSClient(lunarConfig.token);
      const pipeline = client.beginPipeline({
        contextFile: uploadRes.data.result.contextFile,
        name: lunarConfig.name,
        port: lunarConfig.port,
        projectId: lunarConfig.projectId,
        replicas: lunarConfig.replicas,
        subdomain: lunarConfig.subdomain,
      });
      cli.action.start("Connecting to deployment service");
      await pipeline.next();
      cli.action.stop();

      cli.action.start("Initializing builder");
      await pipeline.next();
      cli.action.stop();

      cli.action.start("Building image");
      console.clear();
      for await (const data of pipeline) {
        if (IsLog(data)) {
          console.log(atob(data.log));
          continue;
        }
        break;
      }
      cli.action.stop();

      cli.action.start("Deploying image");
      const connected = await pipeline.next() as unknown as LunarResponse<{componentId: string}>;
      cli.action.stop();

      client.close();
      console.log(
        `Successfuly deployed ${lunarConfig.name} to https://${lunarConfig.subdomain}.lunarbase.app`,
      );
      // promises.writeFile(
      //   ".lunarconfig.json",
      //   JSON.stringify({ ...lunarConfig, connectedDeploy: connected.result.componentId }, null, 2),
      // );
      // cli.action.start("Initializing builder");
      // const createRes = await axios.post(
      //   "https://cs-0.dev.offline.codes/proxy/3000/createBuilder",
      //   { ...uploadRes.data, user: "testuser" },
      // );
      // cli.action.stop();
      // if (!createRes.data.error) {
      //   cli.action.start("Building image");
      //   const buildRes = await axios.post(
      //     "https://cs-0.dev.offline.codes/proxy/3000/buildImage",
      //     {
      //       ...uploadRes.data,
      //       ...createRes.data,
      //       user: "testuser",
      //     },
      //   );
      //   cli.action.stop();
      //   if (!buildRes.data.error) {
      //     cli.action.start("Deploying image");
      //     const connected = await axios.post(
      //       "https://cs-0.dev.offline.codes/proxy/3000/deployWeb",
      //       {
      //         ...lunarConfig,
      //         user: "testuser",
      //         image:
      //           `lunarbasedev.azurecr.io/${createRes.data.imageName}:latest`,
      //       },
      //     );
      //     cli.action.stop();
      //     console.log(
      //       `Successfuly deployed ${lunarConfig.name} to https://${lunarConfig.subdomain}.lunarbase.app`,
      //     );
      //     promises.writeFile('.lunarconfig.json', JSON.stringify({...lunarConfig, connectedDeploy: connected.data}))
      //   } else {
      //     cli.action.stop("failed");
      //     console.log("Build logs are shown below");
      //     console.log(buildRes.data.error);
      //   }
      // }
    }
  }
}
