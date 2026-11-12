---
title: Constant Literals
description: Literals for integers, floats, booleans, chars, bytes, strings and arrays.
---

A literal writes compile time data straight into the source. Zeen has integer, float, boolean, char, byte char, string, raw string and array literals.

## Integer literals

Four bases are supported, and `_` groups digits:

```zn
fn main() {
  @println("{}", 1000);
  @println("{}", 1_000);
  @println("{}", 0b111110100);
  @println("{}", 0x3E8);
  @println("{}", 0o1750);
}
```

All six lines hold `1000`. An integer literal defaults to `i32`. The context sets the real type, and the value has to fit it:

```zn
fn main() {
  const small: i32 = 123;
  const large: i64 = 9223372036854775807;

  @println("{} {}", small, large);
}
```

A value that does not fit the target type is rejected instead of truncated:

```zn
fn main() {
  const too_big: i32 = 9223372036854775807;
}
```

A literal that does not parse into `i64` at all fails earlier, in the parser.

## Float literals

Floats default to `f64`:

```zn
fn main() {
  const plain: f64 = 1.0;
  const short: f64 = 1.;
  const precise: f64 = 3.1415926535897932384626;

  @println("{} {} {}", plain, short, precise);
}
```

## Boolean literals

`true` and `false` have the `bool` type:

```zn
fn main() {
  const ready: bool = true;
  const done: bool = false;

  @println("{} {}", ready, done);
}
```

## Chars

A char is one byte written between single quotes. Escape sequences such as `\n` and `\t` work. Only ASCII fits, since `char` stores a single byte:

```zn
fn main() {
  const letter: char = 'a';
  const digit: char = '7';

  @println("{:?} {:?}", letter, digit);
}
```

A non-ASCII char literal is rejected, since one byte cannot hold it. Use `Rune` from `core.unicode` for code points.

## Byte chars

A byte char has the `u8` type and uses the same escapes with a `b` prefix:

```zn
fn main() {
  const letter: u8 = b'a';
  const terminator: u8 = b'\0';

  @println("{} {}", letter, terminator);
}
```

## Strings

A string literal sits between double quotes and ends with a null byte in memory. Its type is `[N + 1]char`, which coerces to `[]const char` wherever a slice is expected:

```zn
fn main() {
  const slice: []const char = "Hello, World!";
  const array: [5]char = "Zeen";

  @println("{} {}", slice, array);
}
```

Both forms print as text. A string may hold UTF-8 bytes, and the count in `[N + 1]char` is a byte count.

## Raw strings

A raw string starts with `r#"` and ends with `"#`. Nothing between the markers is escaped, so quotes and backslashes appear as written:

```zn
fn main() {
  @println("{}", r#"a "quoted" path C:\temp"#);
}
```

## Arrays

An array literal puts its elements between braces, and the type is `[N]T`:

```zn
fn main() {
  const numbers = {1, 2, 3, 4};

  @println("{:?}", numbers);
}
```

The repeat form fills `N` copies of one value, where `N` is comptime known:

```zn
fn main() {
  const zeroed: [1024]i32 = {0; 1024};

  @println("{} {}", zeroed.len, zeroed[0]);
}
```

The old bracket form `[1, 2, 3]` is a syntax error. `[0]T` does not exist, an array always holds at least one element.
