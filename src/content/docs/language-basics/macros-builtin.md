---
title: Builtin Macros
description: Compiler macros for casts, sizes, printing, panics, enums and comptime.
---

Compiler macros use `@name(...)` syntax and are built into the compiler.

## Values and types

`@as(T, value)` converts a value to another type. Numeric casts truncate to the target width, so `@as(u8, 300)` is `44`:

```zn
fn main() {
  const byte: u8 = @as(u8, 300);
  const wide: i64 = @as(i64, byte);

  @println("{} {}", byte, wide);
}
```

Pointers and function values cast between each other through `@as`. Enum casts follow the rules on [Enums](/functions-closures/enums/): an int to a value-carrying enum is not allowed.

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

`@uninit()` produces an uninitialized value of the expected type. Fill it before reading, since reading a field that was never written is undefined behavior:

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

## Printing

| Macro | Returns | Behavior |
|---|---|---|
| `@print(fmt, ...)` | `void` | writes to stdout |
| `@println(fmt, ...)` | `void` | writes to stdout with a newline |
| `@format(fmt, ...)` | `String` | builds a heap string |
| `@dbg(expr)` | the value of `expr` | prints `[file:line]> \`expr\` = value` in Debug builds |

The format string has to be a literal. `@dbg` prints nothing in Release and returns the value unchanged. [Printing and Formatting](/ownership-types/printing-formatting/) covers the specifiers and the `Display` and `Debug` interfaces.

## Panics

`@panic(fmt, ...)` stops the program with a message and has the `never` type. The message takes the same literal format string as `@println`. `@unreachable()` and `@todo()` panic with fixed messages:

```zn
fn check(value: i32) i32 {
  if (value < 0) {
    @panic("negative value: {}", value);
  };

  return value;
}

fn main() {
  @println("{}", check(5));
}
```

`@unreachable()` reports `entered unreachable code`. `@todo()` reports `not implemented yet`.

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

`@variantNames` and `@variantCount` work on enums with payloads as well as empty ones.

## Void

`@void()` no longer exists and reports `zeen::typechecker::void_macro_removed`. Use `.{ }` for a void value or an empty struct initialization:

```zn
fn log() void {
  return .{ };
}

fn main() {
  log();
}
```

`Result.Ok(.{ })` builds the success side of `Result[void, E]`.

## Comptime macros

| Macro | Returns |
|---|---|
| `@zeen_type(T)` | `zeen_type`, a captured type |
| `@zeen_expr(expr)` | `zeen_expr`, a captured expression |
| `@zeen_decl(decl)` | `zeen_decl`, a captured declaration |
| `@emit(decl)` | `void`, emits a captured declaration |
| `@fresh_name(prefix)` | `comptime_str`, a unique name |
| `@fields(T)` | array of `Field` records |
| `@variants(T)` | array of `Variant` records |
| `@typeInfo(T)` | `comptime_str`, `struct` or `enum` |
| `@hasField(T, name)` | `bool` |
| `@fieldType(T, name)` | the field type |

A captured type works as an alias, and `$(...)` splices comptime values into the captured syntax:

```zn
comptime fn array_type(n: comptime_int) zeen_type {
  return @zeen_type([$(n)]i32);
}

alias Buffer = array_type(3);

fn main() {
  const values: Buffer = {1, 2, 3};

  @println("{}", values[1]);
}
```

`@zeen_expr` captures an expression that `$(...)` later inserts into code:

```zn
comptime fn twice(n: comptime_int) zeen_expr {
  return @zeen_expr($(n) + $(n));
}

comptime Captured = @zeen_expr(1 + 2);

fn main() {
  const sum = $(Captured);
  const four = $(twice(2));

  @println("{} {}", sum, four);
}
```

`@zeen_decl` captures a declaration, `@emit` splices it into the enclosing declaration scope, and `@fresh_name` mints a new name:

```zn
comptime fn named_struct(name: comptime_str) zeen_decl {
  @zeen_decl(
    pub struct $(name) {
      pub value: i32
    }
  );
}

comptime {
  @emit(named_struct("Alpha"));

  for (i : 0..2) {
    let name = @fresh_name("Item");

    @emit(@zeen_decl(
      pub struct $(name) {
        pub index: i32
      }
    ));
  }
}

fn main() {
  const alpha = Alpha { .value = 10 };
  const second = Item_1 { .index = 2 };

  @println("{} {}", alpha.value, second.index);
}
```

Reflection macros read a type at comptime:

```zn
struct Point {
  pub x: i32,
  pub y: i64,
}

enum Shape {
  empty,
  circle: f64,
}

comptime {
  @println("{}", @typeInfo(Point));
  @println("{} {}", @hasField(Point, "x"), @fieldType(Point, "y"));

  for (field : @fields(Point)) {
    @println("{}: {}", field.name, field.ty);
  }

  for (variant : @variants(Shape)) {
    @println("{} {}", variant.name, variant.payload);
  }
}

fn main() {
}
```

A `Field` record holds `index`, `name` and `ty`. A `Variant` record holds `index`, `name` and `payload`, where `payload` is `none` or `value`.
