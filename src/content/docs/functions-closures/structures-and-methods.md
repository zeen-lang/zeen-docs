---
title: Structures and Methods
description: Struct fields, construction, inherent implement blocks, overloads, receivers, Copy and Drop.
---

## Structures

A struct groups named values under one type. Each field has a name and a type. Fields are private by default: only methods of the type can read them. `pub` makes a field readable from outside the type.

```zn
struct Person {
  pub age: u32,
  pub name: String,
}
```

Construction names every field:

```zn
const name = String.from("Ada");
const person = Person { .age = 26, .name = name };
```

When the type is already known, the short form drops the name:

```zn
const person: Person = .{ .age = 26, .name = String.from("Ada") };
```

A missing field is `zeen::typechecker::missing_fields`, an unknown one is `zeen::typechecker::unknown_field`, and a field written twice is `zeen::typechecker::duplicate_field`. `.{ }` with no expected struct type is `void`, so `let marker: Marker = .{};` builds an empty struct and `let v: void = .{};` builds a void value.

Fields read with a dot:

```zn
@println("{} {}", person.age, person.name);
```

## Generic Structures

A struct takes generic parameters, with bounds if needed:

```zn
struct Box[T] {
  pub inner: T,
}

struct Sorted[T: Ord] {
  pub items: []T,
}
```

The type arguments go in brackets in a type position: `Box[i32]`, `Box[f64]`.

## Methods

Methods can live inside the struct body or in a separate `implement` block. Both forms work the same way:

```zn
struct Person {
  pub age: u32,
}

implement Person {
  pub fn new(age: u32) Self {
    return .{ .age = age };
  }

  pub fn birthday(*self) {
    self.age += 1;
  }
}

fn main() {
  let person = Person.new(26);

  person.birthday();

  @println("{}", person.age);
}
```

`Person.new(26)` is a static call on the type. `person.birthday()` is a method call on a value. `Self` is the owner type of the block.

Block position in the file does not matter, and the methods are visible across the whole module. The same name with the same arguments and bounds in two places is `zeen::typechecker::duplicate_method`.

The receiver comes from the first parameter when that parameter has no name:

| Receiver | Mode |
|----------|------|
| `self` | owned value |
| `const self` | owned, read only |
| `*self` | mutable borrow |
| `*const self` | read only borrow |

A parameter with a name is an ordinary argument, even when its type is `Self`. Such a method is static:

```zn
struct Person {
  pub age: u32,
}

implement Person {
  pub fn tag_of(person: Person) u32 {
    return person.age;
  }
}

fn main() {
  const person: Person = .{ .age = 26 };

  @println("{}", Person.tag_of(person));
}
```

The standard library keeps methods of field-carrying types in `implement` blocks and methods of field-less helper types in the body. That is a convention, not a language rule.

Builtin types such as `i32` and `[]u8` take methods through `implement builtin`, covered on [Builtin Blocks](/functions-closures/implement-builtin/).

## Overloads and Specialization

Two blocks can declare the same method name when they differ by block bounds or by concrete type arguments. The signatures must match.

```zn
struct Box[T] {
  pub inner: T,
}

implement[T: Copy] Box[T] {
  pub fn duplicate(self) Box[T] {
    return .{ .inner = self.inner };
  }
}

implement[T: Clone] Box[T] {
  pub fn duplicate(self) Box[T] {
    return .{ .inner = self.inner.clone() };
  }
}

fn main() {
  const number = Box { .inner = 5 };
  const text = Box { .inner = String.from("hi") };

  @println("{} {}", number.duplicate().inner, text.duplicate().inner);
}
```

`i32` is `Copy`, so `number` uses the `Copy` block. `String` is `Clone`, so `text` uses the `Clone` block.

A block can also specialize on a concrete type argument:

```zn
struct Point[T] {
  pub x: T,
  pub y: T,
}

implement Point[i32] {
  pub fn zero() Point[i32] {
    return .{ .x = 0, .y = 0 };
  }

  pub fn tag_of(value: Point[i32]) u8 {
    return @as(u8, value.x);
  }
}

fn main() {
  const point: Point[i32] = Point.zero();
  const x = point.x;
  const tag = Point.tag_of(point);

  @println("{} {}", x, tag);
}
```

Selection ranks candidates in this order:

1. a block specialized on the exact concrete type arguments,
2. a block whose bounds hold,
3. a block without bounds,
4. a method declared in the type body,
5. a block whose bounds fail.

Ties keep the block declared first. Overloads must share one signature and differ only in bounds or block type arguments. Header paths such as `implement foo.Bar` are not supported, and there is no ambiguity diagnostic.

## Copy and Drop

A struct is move-only by default, even when every field is `Copy`. `implement Copy : Foo {}` makes assignment and argument passing copy the fields:

```zn
struct Pair {
  pub a: i32,
  pub b: i32,
}

implement Copy : Pair {}

fn take(pair: Pair) i32 {
  return pair.a + pair.b;
}

fn main() {
  const pair: Pair = .{ .a = 1, .b = 2 };

  @println("{} {}", take(pair), take(pair));
}
```

The marker is not checked against the fields. A struct with a `String` field can become `Copy` as well, and every copy then owns the same buffer, so the buffer is freed more than once. Keep `Copy` on plain data without owned resources.

A struct with an explicit `Drop` runs its own cleanup at scope end:

```zn
struct Tag {
  pub name: String,
}

implement Drop : Tag {
  fn drop(self) {
    @println("drop {}", self.name);
  }
}
```

Without an explicit `Drop`, the fields drop in reverse declaration order at scope end. Declaring both `Copy` and `Drop` on one type is `zeen::typechecker::copy_with_drop`.
