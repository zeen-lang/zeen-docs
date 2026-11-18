---
title: Compiler
description: Command line flags, modes and output kinds.
---

```bash
zeen <source> <output>
```

The output path is a base name: the compiler appends the extension the target needs, `.exe` on Windows and `.wasm` on wasm, and nothing on Linux and macOS. Run `zeen` with no arguments to print the usage text.

## Flags

| Flag | Description |
|---|---|
| `-m, --mode <MODE>` | `Debug` (default) or `Release` |
| `--emit <KIND>` | `BIN` (default), `OBJ`, `IR` or `MIR` |
| `--target <TRIPLE>` | Compilation target, defaults to the host |
| `--std <PATH>` | Std project root, the directory holding `src` |
| `--linker-path <PROGRAM>` | Override the detected linker |
| `--link <LIB>` | Link an extra native library, repeatable |
| `--link-dir <PATH>` | Add a library search directory, repeatable |
| `--pkg <NAME=PATH>` | Map a package name to a source directory, repeatable |
| `--small` | Prefer a smaller binary layout, without separate code segments on ELF |
| `--check` | Run every check without code generation |
| `--no-warns` | Silence compiler warnings |
| `--no-color` | Turn off colored output and the box drawing characters |
| `--targets-list` | Print the supported triples |
| `-h, --help` | Print the usage text |
| `-V, --version` | Print the version |

`--std` falls back to `$ZEEN_STD`, then `~/.zeen/std`, then `share/zeen/std` next to the compiler binary. Only programs that `use std.*` need the library; `core` is embedded in the compiler.

## Modes

Debug keeps checks, panic traces and `@dbg` output, and skips optimization. A panic prints the whole call stack:

```text
*> thread "boom" panicked:
too big
  at main.zn:1 "boom"
  at main.zn:7 "main"
```

Release runs the `default<O3>` pipeline, drops `@dbg` and keeps only the location of the panic:

```text
*> thread "boom" panicked at main.zn:1:
too big
```

`@dbg(expr)` prints `[file:line]> \`expr\` = value` once per build and returns the value, so it can wrap any expression without changing the program. Use Release for benchmarks and shipped builds.

## Output kinds

- `BIN` links a binary.
- `OBJ` writes the target object file, `.o` or `.obj`.
- `IR` writes LLVM IR to `<output>.ll`.
- `MIR` writes the lowered graph to `<output>.mir`.

`IR` and `MIR` skip linking, so they work on a machine with no C toolchain. `--check` stops before code generation, with no linker, and is the fastest way to test a change.

Every mode still looks for `fn main`, because it is the entry point of the program, with one exception: a wasm target with the `unknown` OS (`wasm32-unknown-unknown`) may build a library without `main`.

## Examples

```bash
zeen main.zn output
zeen main.zn output -m Release
zeen main.zn output --emit IR
zeen main.zn output --emit MIR
zeen main.zn output --target x86_64-pc-windows-gnu
zeen main.zn game --link raylib --link-dir /usr/lib/raylib
zeen main.zn --check
```

`--targets-list` prints the triples the compiler accepts. [Linking](/toolchain/linking/) explains toolchain selection, cross targets and the link flags.
