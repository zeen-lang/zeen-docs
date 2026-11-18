---
title: Printing and Formatting
description: Format macros, specifiers and Display or Debug implementations.
---

`@print`, `@println` and `@format` take a literal format string followed by values. The format string has to be a literal, so a variable or a concatenation reports `zeen::typechecker::expected_format_str`. The same error appears when the format string is missing.

| Macro | Returns | Behavior |
|---|---|---|
| `@print(fmt, ...)` | `void` | writes to stdout |
| `@println(fmt, ...)` | `void` | writes to stdout with a newline |
| `@format(fmt, ...)` | `String` | builds a heap string |
| `@dbg(expr)` | the value of `expr` | prints `[file:line]> \`expr\` = value` in Debug builds |

`@dbg` compiles to a plain value in Release and prints nothing. `@format` returns `std.string.String`, which the resolver injects when the program needs it.

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

`{hex}`, `{oct}` and `{bin}` accept integers only. `{:.N}` accepts floats only. A mismatch, an unknown specifier or a broken brace reports `zeen::typechecker::format_parse_error`.

## Builtin values

Booleans print as `true` and `false`. Characters print as one character. Integers print in decimal and floats print with six digits unless `{:.N}` overrides it. A `[]const char` or a `String` prints its bytes.

An empty-only enum prints its variant name with `{}` and `Type.variant` with `{:?}`. An enum with a payload implements neither.

## Arrays and slices

`{}` works only for a char array or a char slice, `[N]char`, `[]char` or `[]const char`, and prints the characters as text. Any other array or slice with `{}` reports `zeen::typechecker::interface_not_implemented` for `Display`. Display is not derived from the element type.

`{:?}` prints a container as `{1, 2, 3}`. The element has to implement `Debug`, and the check runs for every nested level:

```zn
fn main() {
  const numbers = {1, 2, 3, 4};
  const letters: [5]char = {'h', 'e', 'l', 'l', 'o'};
  const words: [2][]const char = {"a", "bb"};

  @println("{:?}", numbers);
  @println("{} {:?}", letters, letters);
  @println("{:?}", words);

  const nested = {{1, 2}, {3, 4}};

  @println("{:?}", nested);

  const text = @format("{:?}", numbers);

  @println("{}", text);
}
```

Char arrays and char slices keep the text form in `{}` and gain quotes in `{:?}`: `hello` becomes `"hello"`. `String` values follow the same rule and print `"hi"` with `{:?}`. An empty slice prints `{}`. A zero-length array cannot be declared, so `[0]T` and `{}` report `zeen::typechecker::empty_array`.

`@format("{:?}", value)` writes exactly the same text into a `String` that `@println("{:?}", value)` sends to stdout.

## Display and Debug

Both interfaces live in `core.io`. The sink is any `StrWriter`, which `OutStream` and `String` implement. That is why the same `display` or `debug` method feeds stdout and `@format`.

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

`{}` needs `Display` and `{:?}` needs `Debug`. A type with only one of them reports `zeen::typechecker::interface_not_implemented` for the missing interface. The interfaces are covered with the rest of `core.io` on the [core io page](/library/core/io/).
