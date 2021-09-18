import { Log } from "./Log";

export function IsLog(data: any): data is Log {
    return data.isLog !== undefined;
}