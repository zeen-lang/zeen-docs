---
title: Generic Types
description: Generic declarations, monomorphization, bounds, implement blocks and inference.
---

Generics let one definition work with many types. Write it once, and the compiler stamps a copy per type used.

## Declarations

Generic parameters go in brackets after the name:

```zn
fn identity[T](value: T) T {
  return value;
}

struct Box[T] {
  pub value: T,
}

enum Outcome[T, E] {
  ok: T,
  err: E,
}

alias Ptr[T] = *T;
```

In a type position the arguments go in the same brackets:

```zn
Box[i32]
Box[f64]
```

In a value position a static method usually infers the arguments. An explicit form exists when inference is not enough:

```zn
struct Box[T] {
  pub value: T,
}

implement[T] Box[T] {
  pub fn new(value: T) Self {
    return .{ .value = value };
  }

  pub fn get(*const self) T {
    return self.value;
  }
}

fn main() {
  const inferred = Box.new(5);
  const explicit = Box#[i32].new(7);

  @println("{} {}", inferred.get(), explicit.get());
}
```

For a struct literal, annotate the binding and use the short form:

```zn
let boxed: Box[i32] = .{ .value = 5 };
```

`Box#[i32] { .value = 5 }` is the same thing without the annotation.

## Monomorphization

Generics produce a separate copy per concrete type. `Box[i32]` and `Box[f64]` are different types at runtime. A generic function is stamped per call site, so a fat parameter keeps its concrete storage.

## Implement blocks

Methods can live in the type body or in a separate `implement` block:

```zn
struct Point[T] {
  x: T,
  y: T,
}

implement[T] Point[T] {
  pub fn new(x: T, y: T) Self {
    return .{ .x = x, .y = y };
  }

  pub fn get_x(*const self) T {
    return self.x;
  }
}

fn main() {
  const point = Point.new(1, 2);

  @println("{}", point.get_x());
}
```

`new` is a static method called on the type, `get_x` takes a pointer receiver and is called on a value. `Self` refers to the owner of the block. The block header carries the owner generics: `implement[T] Point[T]`.

Block order in the file does not matter, and the methods are visible across the whole module. The same name with the same arguments and bounds in two places is `zeen::typechecker::duplicate_method`.

## Bounds

A bound restricts which types pass. A concrete argument must implement the interface. A generic argument must declare the bound in scope:

```zn
fn min[T: Ord](a: T, b: T) T {
  if (a < b) {
    return a;
  };

  return b;
}
```

Multiple bounds join with `+`: `T: Ord + Copy`. Inside the `implement` block header they narrow the block to types that satisfy them.

An `implement` block can be specialized for concrete arguments:

```zn
struct Point[T] {
  x: T,
  y: T,
}

implement Point[i32] {
  pub fn label(*const self) []const char {
    return "integer point";
  }
}
```

Overloads can differ by bounds. The compiler picks the narrowest block that matches:

```zn
struct Box[T] {
  pub value: T,
}

implement[T] Box[T] {
  pub fn new(value: T) Self {
    return .{ .value = value };
  }
}

implement[T: Copy] Box[T] {
  pub fn describe(*const self) []const char {
    return "copy";
  }
}

implement[T: Clone] Box[T] {
  pub fn describe(*const self) []const char {
    return "clone";
  }
}

fn main() {
  const number = Box.new(1);
  const text = Box.new(String.from("hi"));

  @println("{} {}", number.describe(), text.describe());
}
```

`i32` is `Copy`, so `number` uses the `Copy` block. `String` is `Clone`, so `text` uses the `Clone` block. Overloads must agree on the signature and differ only in bounds or in the block type arguments.

## Where

A `where` clause holds the bounds of a long signature. It starts on its own line, indented two spaces below the signature:

```zn
fn first[T](items: []const T) T
  where T: Copy {
  return items[0];
}
```

With two or more clauses the keyword stands alone and each clause gets four spaces:

```zn
fn pair_up[T, E](left: T, right: E) T
  where
    T: Copy,
    E: Copy {
  return left;
}
```

Inline bounds and `where` are equivalent. Bounds work on functions, structs, enums, methods and aliases:

```zn
struct Sorted[T: Ord] {
  items: []T,
}

alias Printable[T: Display] = T;
```

## Inference

The compiler infers generic arguments from the values it receives:

```zn
struct Slot[T] {
  value: T,
}

implement[T] Slot[T] {
  pub fn empty() Self {
    return .{ .value = @uninit() };
  }

  pub fn set(*self, value: T) {
    self.value = value;
  }

  pub fn get(*const self) T {
    return self.value;
  }
}

fn main() {
  let first = Slot.empty();
  let second = Slot.empty();

  first.set(1);
  second.set(2.5);

  @println("{} {:.1}", first.get(), second.get());
}
```

Each binding is inferred on its own. `first` becomes `Slot[i32]` and `second` becomes `Slot[f64]`. They do not share a `T`.

The same works for `List`:

```zn
use std.collections.list;

fn main() {
  let numbers = List.new();

  numbers.push(4);
  numbers.push(8);

  @println("{}", numbers.len());
}
```

When nothing pins the generic argument, the binding needs an annotation. Without one the compiler reports `zeen::typechecker::cannot_infer_generic`.

```zn
struct Slot[T] {
  value: T,
}

implement[T] Slot[T] {
  pub fn empty() Self {
    return .{ .value = @uninit() };
  }
}

fn main() {
  const slot: Slot[i32] = Slot.empty();

  @println("{}", @typename(typeof slot));
}
```
