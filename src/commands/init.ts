import { Command, flags } from "@oclif/command";
import { existsSync } from "fs";

import { promises } from "fs";
import cli from "cli-ux";

interface LunarBuilder {
  name?: string;
  replicas: number;
  port: number;
  subdomain?: string;
}

export default class Deploy extends Command {
  static description = "Initialize a project for Lunarbase";

  static examples = [
    `$ lunar init`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    let builder: LunarBuilder = {replicas: 0, port: 0};
    const { args, flags } = this.parse(Deploy);
    if (existsSync(".lunarconfig.json")) {
      cli.warn("Detected existing .lunarconfig.json");
      const proceed = await cli.confirm("Continue anyways?");
      if (!proceed) {
        cli.log("Not continuing.");
        return;
      }
    }
    builder.name = await cli.prompt("Project name?");

    builder.replicas = await cli.prompt("Number of replicas?");

    builder.port = await cli.prompt("Exposed port?");

    builder.subdomain = await cli.prompt("Subdomain?");
    cli.log("\n\n\n\n");
    await cli.confirm(`Does this look okay: 
Project name: ${builder.name}
${builder.replicas} replicas
Exposing port ${builder.port}
Hosted at https://${builder.subdomain}.lunarbase.app`);
    promises.writeFile(".lunarconfig.json", JSON.stringify(builder));
  }
}
