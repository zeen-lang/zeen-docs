---
title: Compiler Errors
description: How a Zeen compiler error looks, how to read it and where the error codes are listed.
---

Every rejection carries a stable code, a message that names the problem and, when the compiler knows one, a help line. This page walks through a real report so the codes quoted on the other pages stop looking like noise.

## What a report looks like

A `u8` binding that receives a literal too large for it:

```zn
fn main() {
  const small: u8 = 300;
  @println("{}", small);
}
```

```text
$ zeen main.zn output
Building from `main.zn` entry (root: `/examples`)
Target triple `x86_64-unknown-linux-gnu`
zeen::typechecker::int_literal_out_of_range (link)

  × integer literal `300` does not fit into `u8`
   ╭─[main.zn:2:21]
 1 │ fn main() {
 2 │   const small: u8 = 300;
   ·                     ───
 3 │   @println("{}", small);
   ╰────
  help: annotate the value or use a type it can fit into

[Error]: Compiler returned 1 error(s)
```

## Reading one report

The first two lines are the build header. They name the entry file, the project root and the target triple, and the rest of the file paths in the report are relative to that root.

The code line comes next: `zeen::typechecker::int_literal_out_of_range`. The suffix `(link)` is a terminal hyperlink to the entry on the [Diagnostics](/diagnostics/) page, so a terminal that supports links turns the code into a clickable one.

After an empty line comes the message, marked with `×`:

```text
  × integer literal `300` does not fit into `u8`
```

The frame under it points at the source: `main.zn:2:21` is the file, line and column, and the underline shows the exact span the compiler means. Context lines around the span carry their numbers, so the report survives being copied into a chat.

The `help` line suggests the smallest edit that resolves the error. Some errors have no help, because there is no single fix. The last line counts the errors that stopped the build.

## The stage in the code

`zeen::<stage>::<name>` names the compiler stage that rejected the code and the rule behind it. The middle segment is the crate doing the work:

| Stage | What it rejects |
|---|---|
| `parser` | the shape of the code: a missing bracket, an unknown token, an array literal written the old way |
| `preprocessor` | conditional compilation that leaves a directive malformed |
| `resolver` | a name that does not exist, a module path, a private item reached from outside |
| `typechecker` | a type mismatch, a missing interface, a generic bound that does not hold |
| `dataflow` | ownership: use after move, an uninitialised read, a double drop |
| `mir` | a construct that has no lowering, such as discarding a payload that needs a drop |

The stage tells you where to look first. A `dataflow` error never means a typo in a type name, and a `resolver` error never means a missing `Copy`.

The code is stable across releases. A code copied from an old log still points at the same rule, even when the message wording changes.

## Warnings

A warning uses the same frame with `⚠` and the build continues:

```text
zeen::dataflow::unused_variable (link)

  ⚠ unused variable `unused`
   ╭─[main.zn:2:3]
 1 │ fn main() {
 2 │   const unused = 5;
   ·   ────────────────
 3 │   @println("hi");
   ╰────
  help: consider removing it, or prefixing the name with `_`

[Warn]: Compiler reported 1 warning(s)
```

Pass `--no-warns` to silence all warnings, or put `// @no-warnings` at the top of a file to silence the warnings that come from it.

## Looking a code up

The [Diagnostics](/diagnostics/) page lists every code with an example and the fix. Search it for the code from the report, or open the anchor directly, for example `/diagnostics/#zeen-typechecker-mismatch`.

## Errors without a code

The linker and `zora` report their own failures, and neither prints a `zeen::` code:

- a missing C toolchain or a native library stops at the link step, see [Linking](/toolchain/linking/);
- a missing `Zora.toml` or an unresolvable dependency comes from `zora`, see [Package Manager](/toolchain/package-manager/).

The [Compiler](/toolchain/compiler/) page covers the flags that change the report: `--no-color`, `--no-warns` and `--check`.
