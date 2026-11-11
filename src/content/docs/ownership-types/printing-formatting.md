---
title: Printing and Formatting
description: Format macros, specifiers and Display or Debug implementations.
---

| Macros | Return type | Description |
|--------|-------------|-------------|
| `@print(fmt, ...)` | `void` | write format to stdout |
| `@println(fmt, ...)` | `void` | write format to stdout with newline |
| `@format(fmt, ...)` | `String` | format values into heap `String` |
| `@dbg(expr)` | `expr` | debug provided expression (Debug mode only) |

## Specifiers
| Slot | Meaning |
|------|---------|
| `{}` | value (`Display`) |
| `{:?}` | debug (`Debug`) |
| `{hex}` | hexadecimal |
| `{oct}` | octal |
| `{bin}` | binary |
| `{:.N}` | float with N decimals |

## Display and Debug
Structs opt in through `core.io` interfaces. The sink is any `StrWriter`, so the same code feeds stdout and `String`:
```zn
implement Display : Point {
  fn display[W: StrWriter](*const self, out: *W) void {
    out.write_str("point");
  }
}
```
