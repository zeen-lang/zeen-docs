---
title: Compiler
description: Command line flags, the build pipeline, modes and output kinds.
---

```bash
zeen <source> <output>
```

The source path picks the project root, the directory that `use` paths resolve against. The output path is a base name: the compiler appends the extension the target needs, `.exe` on Windows and `.wasm` on wasm, and nothing on Linux and macOS. Run `zeen` with no arguments to print the usage text.

## What a build does

`zeen main.zn output` runs the same sequence every time:

1. The lexer turns the file into tokens.
2. The parser builds the declaration tree.
3. The preprocessor resolves `@os`, `@arch`, `@debug` and the other conditional blocks, so only one branch of each reaches later stages.
4. The resolver loads `use` paths, injects `core`, runs the compile-time interpreter and builds the symbol table.
5. The tree is lowered to HIR, an arena-free form that later stages can own.
6. The typechecker assigns a type to every expression and checks interfaces, generic bounds and literals.
7. MIR lowering turns the typed tree into a control-flow graph of basic blocks. MIR is the level where ownership is explicit: copies, moves and drops are separate instructions.
8. The flow pass walks that graph, decides which operands move, inserts the drops at scope exits, and reports `use_after_move` and `uninitialized` errors. It also emits the unused-variable warnings.
9. Code generation turns MIR into LLVM IR for the target triple, and LLVM compiles that to an object file.
10. The linker turns the object file into the binary, adding the C runtime and any `--link` libraries.

Steps 7 and 9 are the two forms you can inspect. `--emit MIR` prints the graph after the flow pass, with the moves and drops already chosen, so it answers "why was this value freed here". `--emit IR` prints the LLVM module, annotated with function names such as `multiply$i32` for monomorphized generics.

Compilation and linking are separate failures. A type error stops before code generation; a linker error means the code compiled and the toolchain could not produce the binary. [Linking](/toolchain/linking/) covers the second case.

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

`BIN` links a binary. `OBJ` writes the target object file, `.o` or `.obj`. `IR` writes LLVM IR to `<output>.ll`. `MIR` writes the lowered graph to `<output>.mir`.

`IR` and `MIR` skip linking, so they work on a machine with no C toolchain. `--check` stops after the flow pass: no code generation, no linker, and the fastest way to test a change.

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
