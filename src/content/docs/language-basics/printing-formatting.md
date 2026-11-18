---
title: Printing and Formatting
description: The print macros, format specifiers and Display or Debug implementations.
---

`@println` writes a line to stdout. It takes a literal format string and the values to insert into it:

```zn
fn main() {
  const name = "zeen";
  const version = 6;

  @println("{} {}", name, version);
}
```

```text
zeen 6
```

Two siblings cover the other cases. `@print` skips the newline, and `@format` returns the text as a `String` instead of writing it:

| Macro | Returns | Behavior |
|---|---|---|
| `@print(fmt, ...)` | `void` | writes to stdout |
| `@println(fmt, ...)` | `void` | writes to stdout with a newline |
| `@format(fmt, ...)` | `String` | builds a heap string |

```zn
fn main() {
  const text = @format("{:.3}", 1.0 / 3.0);

  @println("{} and {:?}", text, text);
}
```

```text
0.333 and "0.333"
```

The format string has to be a literal, because every specifier is checked before the program runs. A variable reports `zeen::typechecker::expected_format_str`.

## Specifiers

| Specifier | Meaning |
|---|---|
| `{}` | value through `Display` |
| `{:?}` | value through `Debug` |
| `{hex}` | integer in hexadecimal |
| `{oct}` | integer in octal |
| `{bin}` | integer in binary |
| `{:.N}` | float with `N` digits after the point |
| `{{` and `}}` | literal braces |

```zn
fn main() {
  const n: i32 = 255;
  const pi: f64 = 3.14159;

  @println("{} {:?} {hex} {oct} {bin}", n, n, n, n, n);
  @println("{:.2} {:.0}", pi, pi);
  @println("{{braces}}");
}
```

```text
255 255 ff 377 11111111
3.14 3
{braces}
```

`{hex}`, `{oct}` and `{bin}` accept integers only, and `{:.N}` accepts floats only. Both mismatches report `zeen::typechecker::format_parse_error`, with the found type in the message. The same code covers an unknown specifier and an unclosed brace.

## Builtin values

Booleans print as `true` and `false`, and characters print as one character. Integers print in decimal, floats print with six digits after the point unless `{:.N}` overrides it, and a `[]const char` or a `String` prints its bytes.

An empty enum prints its variant name with `{}` and the qualified form with `{:?}`:

```zn
enum Direction {
  up,
  down,
}

fn main() {
  @println("{} {:?}", Direction.up, Direction.up);
}
```

```text
up Direction.up
```

An enum with a payload implements neither, so `{}` on it reports `zeen::typechecker::interface_not_implemented` for `Display`. Formatting a payload enum means implementing the interface, or handling the value with `switch` first.

## Arrays and slices

`{}` prints text only for a char array or a char slice: `[N]char`, `[]char` or `[]const char`. Any other array reports `interface_not_implemented` for `Display`, because text formatting is not derived from the element type:

```zn
fn main() {
  const numbers = {1, 2, 3, 4};

  @println("{}", numbers);
}
```

```text
zeen::typechecker::interface_not_implemented

  × type `[4]i32` has no implementation for `Display` interface
```

`{:?}` is the container format, and it wraps the elements in braces:

```zn
fn main() {
  const numbers = {1, 2, 3, 4};
  const letters: [5]char = {'h', 'e', 'l', 'l', 'o'};
  const nested = {{1, 2}, {3, 4}};

  @println("{:?}", numbers);
  @println("{} {:?}", letters, letters);
  @println("{:?}", nested);
}
```

```text
{1, 2, 3, 4}
hello "hello"
{{1, 2}, {3, 4}}
```

Every element has to implement `Debug`, and the check reaches nested levels. A char array keeps its text form in `{}` and gains quotes in `{:?}`; a `String` follows the same rule and prints `"hi"`. `@format("{:?}", value)` produces exactly the text that `@println("{:?}", value)` writes. [Arrays, Slices and Ranges](/language-basics/arrays-slices-ranges/) covers the container types.

## Display and Debug

Both interfaces live in `core.io`. `{}` calls `display` and `{:?}` calls `debug`, and each method writes into a generic `StrWriter`. `OutStream` implements it for stdout and `String` implements it for `@format`, so one implementation serves both destinations:

```zn
struct Point {
  pub name: []const char,
}

implement Display : Point {
  fn display[W: StrWriter](*const self, out: *W) void {
    out.write_str(self.name);
  }
}

implement Debug : Point {
  fn debug[W: StrWriter](*const self, out: *W) void {
    out.write_str("Point(");
    out.write_str(self.name);
    out.write_str(")");
  }
}

fn main() {
  const point: Point = .{ .name = "origin" };

  @println("{} {:?}", point, point);
}
```

```text
origin Point(origin)
```

A type with only one of the two interfaces prints with the matching specifier and reports `interface_not_implemented` for the other. [Interfaces](/functions-closures/interfaces/) explains interface blocks, and the [core io page](/library/core/io/) lists the writers with the rest of the module.

## Debug output

`@dbg(expr)` prints one line and returns the value, so it wraps any expression without changing it:

```zn
fn main() {
  const x = @dbg(1 + 2);

  @println("{}", x);
}
```

```text
[main.zn:2]> `1 + 2` = 3
3
```

The prefix is the file and line, and Release builds drop the whole line while keeping the value.
