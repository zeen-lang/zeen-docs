---
title: Builtin Macros
description: Compiler macros for casts, sizes, printing, panics and enums.
---

A macro is written `@name(...)` and handled by the compiler itself. It is not a function: no import provides it, it cannot be redefined, and its arguments are checked with rules that a function signature cannot express. `@as` reads a type as its first argument, `@sizeof` accepts a type or a value and `@panic` takes a format string, which is why these live outside the ordinary call syntax.

## Values and types

`@as(T, value)` converts a value to another type. Numeric casts truncate to the target width, so `@as(u8, 300)` is `44`:

```zn
fn main() {
  const byte: u8 = @as(u8, 300);
  const wide: i64 = @as(i64, byte);

  @println("{} {}", byte, wide);
}
```

Pointers and function values cast between each other through `@as`. Enum casts follow the rules on [Enums](/functions-closures/enums/): an integer becomes an empty enum value, while a variant that carries a payload cannot be built that way.

`@sizeof(T)` and `@alignof(T)` give the size and alignment of a type. Both return `usize` at runtime and `comptime_int` in comptime:

```zn
struct Point {
  pub x: i32,
  pub y: f64,
}

fn main() {
  @println("{} {}", @sizeof(Point), @alignof(Point));
}
```

`@typename(T)` returns the type name as a `[]const char`:

```zn
fn main() {
  @println("{} {}", @typename(i32), @typename(f64));
}
```

`@typename(typeof value)` is the usual way to ask what the compiler inferred for a binding.

`@uninit()` produces an uninitialized value of the expected type. Fill every field before reading, since a read of a field that was never written is undefined behavior:

```zn
struct Pair {
  pub a: i32,
  pub b: i32,
}

fn make() Pair {
  let pair: Pair = @uninit();

  pair.a = 1;
  pair.b = 2;

  return pair;
}

fn main() {
  const pair = make();

  @println("{} {}", pair.a, pair.b);
}
```

The expected type comes from the annotation, so `@uninit()` needs one. It exists for cases a literal cannot express, such as a large array filled field by field.

## Printing

| Macro | Returns | Behavior |
|---|---|---|
| `@print(fmt, ...)` | `void` | writes to stdout |
| `@println(fmt, ...)` | `void` | writes to stdout with a newline |
| `@format(fmt, ...)` | `String` | builds a heap string |
| `@dbg(expr)` | the value of `expr` | prints `[file:line]> \`expr\` = value` in Debug builds |

The format string has to be a literal, because the specifiers are checked at compile time. `@dbg` prints nothing in Release and returns the value unchanged. [Printing and Formatting](/language-basics/printing-formatting/) covers the specifiers and the `Display` and `Debug` interfaces.

## Panics

`@panic(fmt, ...)` stops the program with a message and has the `never` type. The message takes the same literal format string as `@println`:

```zn
fn check(value: i32) i32 {
  if (value < 0) {
    @panic("negative value: {}", value);
  }

  return value;
}

fn main() {
  @println("{}", check(5));
}
```

`@unreachable()` reports `entered unreachable code` and `@todo()` reports `not implemented yet`. Both have the `never` type, so they fit in a branch that would otherwise need to return a value.

## Enums

`@enumTag(expr)` returns the runtime tag as `u8`. `@variantNames(T)` returns `[N][]const char` and `@variantCount(T)` returns the number of variants as `comptime_int`:

```zn
enum Color {
  red,
  green,
  blue,
}

fn main() {
  @println("{} {}", @enumTag(Color.green), @variantCount(Color));
  @println("{:?}", @variantNames(Color));
}
```

```text
1 3
{"red", "green", "blue"}
```

`@variantNames` and `@variantCount` work on enums with payloads as well as empty ones. [Enums](/functions-closures/enums/) covers the tag representation.

## Compile-time macros

A second group runs only inside comptime code and produces types, expressions or declarations: `@zeen_type`, `@zeen_expr`, `@zeen_decl`, `@emit`, `@fresh_name`, and the reflection macros `@fields`, `@variants`, `@typeInfo`, `@hasField` and `@fieldType`. Outside comptime they report `zeen::typechecker::unknown_macro`. [Compile Time Engine](/ownership-types/compile-time-engine/) covers them with the interpreter that runs them.
