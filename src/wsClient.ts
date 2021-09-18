import WebSocket from "ws";
import { Log } from "./interfaces/Log";
import { LunarResponse } from "./interfaces/LunarResponse";
import { WSDeployParams } from "./interfaces/WSDeployParams";

export class WSClient {
  private ws: WebSocket;
  constructor(private token: string) {
    this.ws = new WebSocket("ws://cs-0-ws.dev.offline.codes");
  }

  private waitForOpen() {
    return new Promise<void>((resolve) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      this.ws.on("open", () => resolve());
    });
  }

  private connectToChannel(channel: string) {
    this.ws.send(
      JSON.stringify({
        connect_to: [channel],
      })
    );
  }

  private sendToChannel(channel: string, message: unknown) {
    this.ws.send(
      JSON.stringify({
        send_packet: {
          to: channel,
          message: message,
        },
      })
    );
  }

  private authorizedPacket<T>(content: T) {
    return {
      authorization: this.token,
      content: content,
    };
  }

  async *beginPipeline(params: WSDeployParams) {
    await this.waitForOpen();
    const waitForResponse = () =>
      new Promise<string>((resolve) => {
        this.ws.on("message", (data: Buffer) => {
          // console.log(data?.toString());
          this.ws.removeAllListeners();
          resolve(data?.toString());
        });
      });

    const responseGenerator = async function* () {
      while (true) {
        yield await waitForResponse();
      }
    };
    this.connectToChannel("localDeploy");
    await waitForResponse();
    yield;
    this.sendToChannel("localDeploy", this.authorizedPacket(params));
    const initRes = JSON.parse(await waitForResponse())
      .message as LunarResponse<null>;
    if (!initRes.success) {
      throw new Error(initRes.error ?? undefined);
    }
    yield;
    const gen = responseGenerator();
    for await (const log of gen) {
      const data = JSON.parse(log).message as Log;
      if (data.isLog) {
        yield data;
        continue;
      }
      const buildRes = JSON.parse(log).message as LunarResponse<null>;
      if (!buildRes.success) {
        throw new Error(buildRes.error ?? undefined);
      }
      yield buildRes;
      break;
    }
    const deployRes = JSON.parse(await waitForResponse())
      .message as LunarResponse<null>;
    if (!deployRes.success) {
      throw new Error(deployRes.error ?? undefined);
    }
    yield deployRes;
  }
  close() {
    this.ws.terminate();
  }
}
