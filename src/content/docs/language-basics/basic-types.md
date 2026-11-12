---
title: Basic Types
description: Integer, float, bool, char and void types, typeof, casts and builtin methods.
---

Zeen has 16 builtin types: signed and unsigned integers, two floats, `bool`, `char`, `void` and `never`.

## Integer types

| Length | Signed | Unsigned |
|--------|--------|----------|
| 8-bit | `i8` | `u8` |
| 16-bit | `i16` | `u16` |
| 32-bit | `i32` | `u32` |
| 64-bit | `i64` | `u64` |
| pointer-sized | `isize` | `usize` |

An integer literal defaults to `i32` when nothing else fixes its type. A literal that does not fit the target type is `zeen::typechecker::int_literal_out_of_range` instead of a silent truncation:

```zn
let small: u8 = @as(u8, 200);
let wide: i64 = @as(i64, small);

@println("{} {}", small, wide);
```

There is no implicit widening between integer types. `let value: u8 = 1; let size: usize = value;` reports `zeen::typechecker::mismatch`, so the conversion needs an annotation on the literal or `@as`.

## Float types

| Type | Description |
|------|-------------|
| `f32` | 32-bit float |
| `f64` | 64-bit float |

A float literal defaults to `f64`. Floating point comparison follows IEEE rules: NaN is not equal to anything, itself included, and every ordering operator returns `false` when a NaN is involved.

## Other types

| Type | Description |
|------|-------------|
| `bool` | `true` or `false` |
| `char` | One byte, written as `'a'` |
| `void` | No value |
| `never` | Never returns, as in `@panic` |

`char` holds a single byte, so a literal outside ASCII is `zeen::typechecker::non_ascii_char` and gets a help to use a string literal. Text and code points go through `[]const char` and [Rune](/library/core/unicode/).

`void` has one value, written `.{ }`. The old `@void()` macro is gone and reports `zeen::typechecker::void_macro_removed`:

```zn
fn log() void {
  return .{ };
}

fn main() {
  log();
}
```

`never` is the type of an expression that does not finish, such as `@panic("...")` or `@unreachable()`. It coerces to any type, so it fits where a value is expected.

## Typeof

`typeof EXPR` takes the type of an expression without running it. Combined with `@typename` it names the type:

```zn
fn hello() i32 {
  return 1;
}

fn main() {
  const func: typeof hello = hello;

  @println("{} {}", @typename(typeof func), @typename(typeof 123));
}
```

## Casts

An implicit cast happens without `@as`. It covers:

| From | To |
|------|----|
| int or float literal | a concrete int or float |
| `*T` | `*const T` |
| `*T` | `*void`, and back |
| string literal | `[]const char`, `[*]const char` |
| `fn` | `Fn`, `FnOnce` |
| `Fn` | `FnOnce` |
| `never` | any type |

Everything else needs `@as`:

| From | To |
|------|----|
| numeric | numeric |
| `bool`, `char` | integer, and back |
| pointer | pointer, integer, `fn` |
| `fn` | pointer |
| integer | an empty-only enum |

```zn
enum Level {
  low,
  high,
}

fn main() {
  const code = @as(u8, true);
  const letter = @as(char, @as(u8, 65));
  const level = @as(Level, @as(u8, 1));

  @println("{} {} {}", code, letter, @enumTag(level));
}
```

`@as` between pointers and integers keeps the address:

```zn
fn main() {
  const value: i32 = 5;
  const raw: *const i32 = &value;
  const addr = @as(usize, raw);
  const back: *const i32 = @as(*const i32, addr);

  @println("{}", *back);
}
```

A cast to an enum works only for an enum with no payloads. `@as(i32, some_enum)` is `zeen::typecheck::enum_as_int_forbidden`, and `@enumTag(expr)` reads the tag instead.

## Builtin methods

Every builtin type implements the `core.ops` interfaces, so their methods are callable directly and resolve without an `implement` block.

| Interface | Method | Result |
|-----------|--------|--------|
| `Eq` | `eq(*const self, *const Self)` | `bool`, same as `==` |
| `Ord` | `cmp(*const self, *const Self)` | `Ordering`, same as the ordering operators |
| `Hash` | `hash(*const self)` | `u64` |
| `Add` ... `Mod` | `add`/`sub`/`mul`/`div`/`mod` | the same as the operator |
| `BitAnd` ... `BitShr` | `bit_and`/`bit_or`/`bit_xor`/`bit_shl`/`bit_shr` | the same as the operator |
| `Neg`, `Not`, `BitNot` | `neg`/`not`/`bit_not` | the same as the operator |

```zn
fn main() {
  const a: i32 = 5;
  const b: i32 = 5;

  @println("{} {}", a.eq(&b), a.cmp(&b));
  @println("{} {}", a.add(b), 1.5.add(2.5));
}
```

`cmp` returns `core.ops.Ordering`, which works in a `switch`:

```zn
fn main() {
  const a: i32 = 3;
  const b: i32 = 7;

  switch (a.cmp(&b)) {
    .Less => @println("less"),
    .Equal => @println("equal"),
    .Greater => @println("greater"),
  };
}
```

A literal receiver works too: `4.eq(&5)`, `1.5.add(2.5)`. The methods follow the operator behavior, so `div` and `mod` by zero panic in Debug, unsigned overflow wraps and a float division by zero produces infinity.

`Ord` on `f32` and `f64` compares with two relations and treats the rest as `Equal`, so `nan.cmp(&one)`, `one.cmp(&nan)` and `nan.cmp(&nan)` all give `Ordering.Equal`.

The methods accept a pointer receiver, so the hash of a pointer is the hash of its value:

```zn
const a: i32 = 5;
const b: i32 = 5;
const p: *const i32 = &a;

@println("{} {}", p.eq(&b), p.hash() == a.hash());
```

They work in generic code with the matching bound:

```zn
fn same[T: Eq](a: *const T, b: *const T) bool {
  return (*a).eq(b);
}
```

An own method in an `implement builtin` block with the same name takes priority, and core interfaces cannot be reimplemented for builtin types. [Builtin Blocks](/functions-closures/implement-builtin/) covers both.

Numbers, `char` and `bool` also get std methods such as `count_ones`, `sqrt` and `to_string` from the `std.primitives` modules.
