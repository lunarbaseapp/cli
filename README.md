cli
===

Official Lunarbase CLI

[![Version](https://img.shields.io/npm/v/@lunarbase/cli.svg)](https://npmjs.org/package/@lunarbase/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@lunarbase/cli.svg)](https://npmjs.org/package/@lunarbase/cli)
[![License](https://img.shields.io/npm/l/@lunarbase/cli.svg)](https://github.com/lunarbaseapp/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @lunarbase/cli
$ lunar COMMAND
running command...
$ lunar (-v|--version|version)
@lunarbase/cli/0.0.0 linux-arm64 node-v16.8.0
$ lunar --help [COMMAND]
USAGE
  $ lunar COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lunar deploy [FILE]`](#lunar-deploy-file)
* [`lunar help [COMMAND]`](#lunar-help-command)

## `lunar deploy [FILE]`

Deploy a folder to Lunarbase

```
USAGE
  $ lunar deploy [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ lunar deploy
  hello world from ./src/hello.ts!
```

_See code: [src/commands/deploy.ts](https://github.com/lunarbaseapp/cli/blob/v0.0.0/src/commands/deploy.ts)_

## `lunar help [COMMAND]`

display help for lunar

```
USAGE
  $ lunar help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_
<!-- commandsstop -->
