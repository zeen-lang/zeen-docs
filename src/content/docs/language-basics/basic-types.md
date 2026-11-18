---
title: Basic Types
description: Integer, float, bool, char and void types, casts, typeof and builtin methods.
---

Every value in Zeen has a type, and most of the time the compiler infers it from the literal or from the binding. This page lists the types built into the language, the conversions between them and the methods that every builtin value already has. Structs, enums and generics come later; everything here works without imports.

## Integer types

| Length | Signed | Unsigned |
|--------|--------|----------|
| 8-bit | `i8` | `u8` |
| 16-bit | `i16` | `u16` |
| 32-bit | `i32` | `u32` |
| 64-bit | `i64` | `u64` |
| pointer-sized | `isize` | `usize` |

An integer literal defaults to `i32` when nothing else fixes its type. A literal that does not fit the target type is rejected with [`zeen::typechecker::int_literal_out_of_range`](/getting-started/compiler-errors/) instead of being truncated silently:

```zn
fn main() {
  const small: u8 = @as(u8, 200);
  const wide: i64 = @as(i64, small);

  @println("{} {}", small, wide);
}
```

There is no implicit widening between integer types. A `u8` does not become a `usize` on its own:

```zn
fn main() {
  const value: u8 = 1;
  const size: usize = value;
}
```

```text
zeen::typechecker::mismatch

  × expected type `usize`, but found `u8`
```

The conversion needs `@as(usize, value)`, or the literal can be annotated directly when the value is known at compile time.

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

`char` holds a single byte, so a literal outside ASCII is [`zeen::typechecker::non_ascii_char`](/getting-started/compiler-errors/) and gets a help to use a string literal. Text and code points go through `[]const char` and [Rune](/library/core/unicode/).

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

Some conversions happen without a cast, because they cannot lose information or change representation:

| From | To |
|------|----|
| int or float literal | a concrete int or float |
| `*T` | `*const T` |
| `*T` | `*void`, and back |
| string literal | `[]const char`, `[*]const char` |
| `fn` | `Fn`, `FnOnce` |
| `Fn` | `FnOnce` |
| `never` | any type |

Everything else needs `@as(T, expr)`, which is a compiler macro rather than a function call. It produces a value of type `T` from `expr` and leaves the representation unchanged unless the types differ in width:

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

The first argument is a type, the second a value, and both are checked before the program runs. `@as` between two integer types keeps the low bits, so a value that does not fit is truncated:

```zn
fn main() {
  const wrapped = @as(u8, 300);

  @println("{}", wrapped);
}
```

```text
44
```

That differs from a literal assigned to a `u8`, which is rejected at compile time. `@as` is the explicit request to reinterpret the bits, and it does exactly that. A cast between unrelated types is `zeen::typechecker::invalid_cast`. [Builtin Macros](/language-basics/macros-builtin/) covers the remaining macros.

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

Every builtin type implements the interfaces in `core.ops`, so their methods are callable directly and need no `implement` block. An interface groups a method with an operator: `Eq` gives `eq` and `==`, `Add` gives `add` and `+`. [Interfaces](/functions-closures/interfaces/) explains them; for now it is enough to know the method names exist on `i32`, `f64`, `char` and the rest.

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

`cmp` returns `Ordering`, a core enum with the variants `Less`, `Equal` and `Greater`. `switch` reads it like any other enum:

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
fn main() {
  const a: i32 = 5;
  const b: i32 = 5;
  const p: *const i32 = &a;

  @println("{} {}", p.eq(&b), p.hash() == a.hash());
}
```

They work in generic code with the matching bound:

```zn
fn same[T: Eq](a: *const T, b: *const T) bool {
  return (*a).eq(b);
}
```

An own method in an `implement builtin` block with the same name takes priority, and core interfaces cannot be reimplemented for builtin types. [Builtin Blocks](/functions-closures/implement-builtin/) covers both.

Numbers, `char` and `bool` also get std methods such as `count_ones`, `sqrt` and `to_string` from the `std.primitives` modules. Those modules are injected into every module, so the methods need no import.
