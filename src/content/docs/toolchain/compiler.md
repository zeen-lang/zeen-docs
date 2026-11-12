---
title: Compiler
description: Command line flags, modes, output kinds and usage examples.
---

```bash
zeen <source> <output>
```

The source path picks the project root, and the output path gets an extension from the target: none on Linux, `.exe` on Windows, `.wasm` on Wasm.

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
| `--check` | Run every check without codegen |
| `--no-warns` | Silence compiler warnings |
| `--no-color` | Turn off colored output |
| `--targets-list` | Print the supported triples |
| `-V, --version` | Print the version |

`--std` falls back to `$ZEEN_STD`, then `~/.zeen/std`, then `share/zeen/std` next to the compiler.

## Modes

Debug keeps checks, panic traces and `@dbg` output, and skips optimization. Release runs the `default<O3>` pipeline, drops `@dbg` and prints a short panic location. Use Release for benchmarks and shipped builds.

## Output kinds

`BIN` links a binary. `OBJ` writes the target object file, `.o` or `.obj`. `IR` writes LLVM IR as `.ll`. `MIR` writes the lowered MIR as `.mir` after the flow pass, which is the useful view for checking moves and drops.

`MIR` and `IR` skip linking. `--check` stops after the flow pass as well, so it needs no linker and no `main` for object output.

## Examples

```bash
zeen main.zn output -m Release
zeen main.zn output --emit IR
zeen main.zn output --emit MIR
zeen main.zn output --target x86_64-pc-windows-gnu
zeen main.zn game --link raylib --link-dir /usr/lib/raylib
zeen main.zn --check
```

Targets come from `--targets-list`. [Linking](/toolchain/linking/) covers toolchain selection and the link flags.
