---
title: Builtin Macros
description: Compiler macros for casts, sizes, printing, panic and debug output.
---

Compiler macros use `@name(...)` syntax.

| Macro | Returns |
|-------|---------|
| `@as(T, expr)` | `T`, explicit cast |
| `@sizeof(T)` | `usize`, type size |
| `@alignof(T)` | `usize`, type alignment |
| `@typename(T)` | `[]const char`, type name |
| `@print(fmt, ...)` | `void`, stdout without newline |
| `@println(fmt, ...)` | `void`, stdout with newline |
| `@format(fmt, ...)` | `String`, heap string |
| `@panic(fmt, ...)` | `never` |
| `@unreachable()` | `never` |
| `@todo()` | `never` |
| `@dbg(expr)` | `expr`, prints `[file:line]` with the value (Debug only, silent in Release) |
| `@uninit()` | any, uninitialized value (reading it is UB) |
| `@enumTag(expr)` | `u8`, enum variant tag |
| `@void()` | `void` |
| `@variantNames(T)` | `[N][]const char`, variant names |
| `@variantCount(T)` | `comptime_int`, variant count |

### Comptime Only

| Macro | Returns |
|-------|---------|
| `@zeen_type(T)` | `zeen_type`, comptime type value |
| `@zeen_expr(expr)` | `zeen_expr`, comptime expression value |
| `@zeen_decl(decl)` | `zeen_decl`, comptime declaration value |
| `@emit(decl)` | `void`, emit a comptime declaration |
| `@fresh_name(prefix)` | `comptime_str`, unique name |
| `@fields(T)` | comptime array of `Field` records |
| `@variants(T)` | comptime array of `Variant` records |
| `@typeInfo(T)` | `comptime_str`, `struct` or `enum` |
| `@hasField(T, name)` | `bool` |
| `@fieldType(T, name)` | field type |
