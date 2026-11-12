---
title: Switch
description: Pattern matching over values, ranges, strings, binds and enum variants.
---

A `switch` evaluates the scrutinee once and runs the first matching arm.

```zn
fn main() {
  const answer: i32 = 123;

  const points = switch (answer) {
    123 => 444,
    _ => -1,
  };

  @println("{}", points);
}
```

An arm matches a value, several values, a range, a bind, a wildcard or an enum variant. A bind and a wildcard can carry a guard. Integers, `bool`, `char`, string slices and enums are supported. Floats and structs such as `String` report `zeen::typechecker::switch_unsupported_type`.

## Values and ranges

A range excludes its end, `0..5` covers `0` to `4`. The inclusive form `0..=5` covers `5` too. Alternatives combine with `|`:

```zn
fn tier(level: i32) i32 {
  return switch (level) {
    0..5 | 10..15 => 1,
    20 | 25..30 => 2,
    _ => 0,
  };
}

fn main() {
  @println("{} {} {}", tier(3), tier(12), tier(26));
}
```

Chars take ranges the same way:

```zn
fn grade(letter: char) []const char {
  return switch (letter) {
    'a'..='z' => "lower",
    'A'..='Z' => "upper",
    _ => "other",
  };
}

fn main() {
  @println("{} {} {}", grade('m'), grade('M'), grade('7'));
}
```

`bool` needs both values or a wildcard:

```zn
fn flag_code(flag: bool) i32 {
  return switch (flag) {
    true => 1,
    false => 0,
  };
}

fn main() {
  @println("{}", flag_code(true));
}
```

## Strings

String arms match slice bytes by content. The scrutinee has to be a string slice, `[]const char` or `[]char`:

```zn
fn id(name: []const char) i32 {
  return switch (name) {
    "hello" => 1,
    "mealet" => 2,
    _ => 0,
  };
}

fn main() {
  @println("{} {}", id("mealet"), id("other"));
}
```

`String` is a struct, so a switch over it reports the unsupported type. Switch over `name.slice(..)` instead, or compare two `String` values with `==`.

## Binds and guards

A bare name binds the whole scrutinee. A guard after `if` narrows the arm. Arms run top to bottom, and an arm that can never match is `zeen::typechecker::switch_unreachable_arm`.

```zn
fn bonus(score: i32) i32 {
  return switch (score) {
    value if (value > 999) => 1050,
    value => value + 1,
  };
}

fn main() {
  @println("{} {}", bonus(500), bonus(1200));
}
```

A bare name that resolves to a `const` compares against its value instead of binding:

```zn
const ENOENT: i32 = 2;

fn describe(code: i32) []const char {
  return switch (code) {
    ENOENT => "no such file",
    _ => "other",
  };
}

fn main() {
  @println("{}", describe(2));
}
```

`_` matches anything and binds nothing. `_ if (...)` checks only the guard.

`return`, `break` and `continue` are statements, so an arm that uses one needs a block:

```zn
fn code(value: i32) i32 {
  switch (value) {
    0 => {
      return 10;
    },
    _ => {
      return 20;
    },
  };
}

fn main() {
  @println("{}", code(0));
}
```

## Enums

An enum arm names the variant after a dot. A payload variant binds its payload, and a guard can inspect it. Every variant has to be covered, or the switch needs `_`:

```zn
enum Shape {
  dot,
  rect: i32,
}

fn area(shape: Shape) i32 {
  return switch (shape) {
    .dot => 0,
    .rect(side) => side * side,
  };
}

fn main() {
  @println("{} {}", area(Shape.dot), area(Shape.rect(3)));
}
```

Without `&` the payload moves out of an owned enum, or copies when it is `Copy`. `&name` binds a pointer into the value instead:

```zn
enum Shape {
  dot,
  rect: i32,
}

fn main() {
  const shape = Shape.rect(5);

  switch (shape) {
    .rect(&side) => {
      @println("side: {}", *side);
    },
    .dot => {
      @println("dot");
    },
  };
}
```

`&_` discards the payload without moving it. A bare `_` moves the payload into a dead local and drops it, and that is a hard error for a payload with a drop (`zeen::mir::discard_drop_payload`). Use `&_` there.

## Statement position

A switch works as a statement. The trailing semicolon is optional:

```zn
fn main() {
  const answer: i32 = 1;

  switch (answer) {
    1 => @println("found"),
    _ => @println("missing"),
  }

  @println("done");
}
```
