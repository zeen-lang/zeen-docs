---
title: Enums
description: Enum variants, payload extraction, tags, methods, Copy and Drop rules.
---

## Variants

An enum is a full type, like a struct: it takes generics and gets methods and `implement` blocks. A variant has one of three shapes: empty, a single value or an anonymous struct. Every variant is public.

```zn
enum Value {
  nothing,
  number: i64,
  pair: {
    first: i32,
    second: i32,
  },
}

enum Outcome[T, E] {
  Ok: T,
  Err: E,
}

fn main() {
  const empty_value = Value.nothing;
  const lucky_number = Value.number(5);
  const point = Value.pair { .first = 5, .second = 6 };

  @println("{} {} {}", @enumTag(empty_value), lucky_number.number, point.pair.first);
}
```

Struct payload fields are public and carry no methods of their own. An empty variant is used bare, while a payload variant needs its value. `Outcome` shows the generic form, which is how `Option` and `Result` are defined in core.

## Extraction

A payload reads through `value.variant`. A `Copy` payload copies out; any other payload moves out of an owned enum and consumes it:

```zn
enum Book {
  title: String,
}

fn main() {
  const book = Book.title(String.from("Zeen"));
  const title = book.title;

  @println("{}", title);
}
```

:::caution[Wrong variant in Release]
Reading a variant that the value does not hold is a tag mismatch. Debug checks the tag and panics:

```text
*> thread "main" panicked:
enum tag mismatch: requested tag `1` but found `0`
```

Release runs no check and reads the wrong memory, so the result is undefined. Use `switch` when the variant is not known in advance.
:::

`switch` is the safe way to read a payload. Each arm binds it to a name, and empty variants match by name:

```zn
enum Value {
  nothing,
  number: i64,
  pair: {
    first: i32,
    second: i32,
  },
}

fn main() {
  const point = Value.pair { .first = 5, .second = 6 };

  switch (point) {
    .nothing => @println("empty"),
    .number(value) => @println("single: {}", value),
    .pair(coords) => @println("pair: {} {}", coords.first, coords.second),
  };
}
```

The arms have to cover every variant. `switch` works as a statement and as an expression. [Switch](/functions-closures/switch/) covers patterns, ranges and guards.

With `&` an arm binds a `*Payload` pointer into the enum instead of moving the payload out:

```zn
enum Book {
  title: String,
}

fn main() {
  const book = Book.title(String.from("Zeen"));

  switch (book) {
    .title(&text) => @println("{}", text),
  };
}
```

`&_` discards a payload safely. Bare `_` moves it into a dead local and drops it, which is a hard error for a payload that needs dropping:

```text
zeen::mir::discard_drop_payload

  × discarding a value that needs dropping with `_`
  help: `_` moves the payload out and frees the container; bind it by reference instead: `&_`
```

## Tag

`@enumTag` returns the runtime tag as `u8`:

```zn
enum Value {
  nothing,
  number: i64,
}

fn main() {
  @println("{}", @enumTag(Value.nothing));
}
```

`@variantCount(T)` returns how many variants the enum has, and `@variantNames(T)` returns their names as `[N][]const char`. An empty-only enum is `Copy`, implements `Display`, `Debug` and `==`, and prints its variant name. A value-carrying enum has none of those, so compare it through `switch` or `@enumTag`; `==` on one reports `zeen::typecheck::enum_not_comparable`.

## Methods

Enums take the same `self` receivers as structs, and methods can live in the body or in an `implement` block:

```zn
enum Counter {
  zero,
  count: i32,
}

implement Counter {
  pub fn value(*const self) i32 {
    return switch (*self) {
      .zero => 0,
      .count(count) => count,
    };
  }
}

fn main() {
  const current = Counter.count(41);

  @println("{}", current.value());
}
```

`Self` is the enum type. A generic enum gets an `implement` with the owner generics, and methods can return `Self` or the concrete enum type:

```zn
enum Maybe[T] {
  None,
  Some: T,
}

implement[T] Maybe[T] {
  pub fn some(value: T) Self {
    return Self.Some(value);
  }

  pub fn empty() Maybe[T] {
    return Maybe.None;
  }

  pub fn or_default(*const self, fallback: T) T
    where T: Copy
  {
    return switch (*self) {
      .None => fallback,
      .Some(value) => value,
    };
  }
}

fn main() {
  const some = Maybe.some(7);
  const none: Maybe[i32] = Maybe.empty();

  @println("{} {}", some.or_default(0), none.or_default(0));
}
```

Interfaces apply to enums the same way:

```zn
interface Describe {
  pub fn describe(*const self) []const char;
}

enum Shape {
  circle,
  square,
}

implement Describe : Shape {
  fn describe(*const self) []const char {
    return "shape";
  }
}

fn main() {
  const shape = Shape.circle;

  @println("{}", shape.describe());
}
```

## Copy and Drop

An enum derives `Copy` on its own: it is `Copy` when every payload is, and move-only otherwise. `implement Copy : Foo {}` marks an enum with a move-only payload copyable, so use it only where copying is safe:

```zn
enum Book {
  title: String,
}

fn main() {
  const a = Book.title(String.from("x"));
  const b = a;

  @println("{}", b.title);
}
```

This version moves `a` into `b`, and reading `a` afterwards reports `zeen::dataflow::use_after_move`.

An enum needs a drop when any payload needs one, unless `Drop` is implemented explicitly:

```zn
enum Book {
  title: String,
}

implement Drop : Book {
  fn drop(self) {
    @println("dropping");
  }
}

fn main() {
  const book = Book.title(String.from("x"));

  switch (book) {
    .title(&text) => @println("{}", text),
  };
}
```

Without an explicit `Drop`, the compiler generates one that switches on the tag and drops the live payload. An empty-only enum stores just the `u8` tag. A type with an explicit `Drop` cannot give a payload away by value, because the partial value would skip the custom drop; that read reports `zeen::typecheck::enum_extract_from_drop`. Borrow with `&` instead.
