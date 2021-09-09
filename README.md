cli
===

Official Lunarbase CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cli.svg)](https://npmjs.org/package/cli)
[![Downloads/week](https://img.shields.io/npm/dw/cli.svg)](https://npmjs.org/package/cli)
[![License](https://img.shields.io/npm/l/cli.svg)](https://github.com/lunarbaseapp/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cli
$ lunar COMMAND
running command...
$ lunar (-v|--version|version)
cli/0.0.0 linux-arm64 node-v16.8.0
$ lunar --help [COMMAND]
USAGE
  $ lunar COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lunar hello [FILE]`](#lunar-hello-file)
* [`lunar help [COMMAND]`](#lunar-help-command)

## `lunar hello [FILE]`

describe the command here

```
USAGE
  $ lunar hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ lunar hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/lunarbaseapp/cli/blob/v0.0.0/src/commands/hello.ts)_

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
