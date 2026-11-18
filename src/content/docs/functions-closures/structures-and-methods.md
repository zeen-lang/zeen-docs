---
title: Structures and Methods
description: Struct fields, construction, implement blocks, overloads, receivers, Copy and Drop.
---

## Structures

A struct groups named values under one type. Every field has a name and a type, and fields are private by default: only methods of the type read them. `pub` opens a field to the rest of the program:

```zn
struct Person {
  pub age: u32,
  pub name: String,
}

fn main() {
  const person = Person { .age = 26, .name = String.from("Ada") };

  @println("{} {}", person.age, person.name);
}
```

Construction names every field. When the type is already known from the annotation, the short form drops the name:

```zn
struct Person {
  pub age: u32,
  pub name: String,
}

fn main() {
  const person: Person = .{ .age = 26, .name = String.from("Ada") };

  @println("{}", person.age);
}
```

A missing field is `zeen::typechecker::missing_fields`, an unknown one is `zeen::typechecker::unknown_field` and a field written twice is `zeen::typechecker::duplicate_field`.

`.{ }` with no expected struct type is `void`. That is why `let marker: Marker = .{};` builds an empty struct while `let v: void = .{};` builds a void value.

## Generic structures

A struct takes generic parameters, with bounds when the fields need them:

```zn
struct Box[T] {
  pub inner: T,
}

struct Sorted[T: Ord] {
  pub items: []T,
}

fn main() {
  const boxed: Box[i32] = .{ .inner = 5 };

  @println("{}", boxed.inner);
}
```

Type arguments go in brackets in a type position: `Box[i32]`, `Box[f64]`. [Generic Types](/ownership-types/generic-types/) covers inference and monomorphization.

## Methods

Methods live inside the struct body or in an `implement` block. Both forms behave the same:

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

  pub fn get_age(*const self) u32 {
    return self.age;
  }
}

fn main() {
  let person = Person.new(26);

  person.birthday();

  @println("{}", person.get_age());
}
```

`Person.new(26)` is a static call on the type, `person.birthday()` is a method call on a value and `Self` is the type of the block. The position of the block in the file does not matter, and its methods are visible across the module. The same name with the same arguments and bounds in two places is `zeen::typechecker::duplicate_method`.

The receiver comes from a first parameter that has no name:

| Receiver | Mode |
|----------|------|
| `self` | owned value |
| `const self` | owned, read only |
| `*self` | mutable borrow |
| `*const self` | read only borrow |

`const self` still takes ownership, so a move-only struct that goes through such a method cannot be used afterwards. A named first parameter makes the function static, even when its type is `Self`:

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

The standard library keeps methods of field-carrying types in `implement` blocks and methods of field-less helper types in the body. That is a convention, not a rule. Builtin types such as `i32` and `[]u8` take methods through `implement builtin`, covered on [Builtin Blocks](/functions-closures/implement-builtin/).

## Overloads

Two blocks can declare the same method name when they differ by block bounds or by concrete type arguments. The signatures have to match:

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

`i32` is `Copy`, so `number` takes the first block; `String` is `Clone` and not `Copy`, so `text` takes the second.

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

  pub fn tag_of(value: *const Point[i32]) u8 {
    return @as(u8, value.x);
  }
}

fn main() {
  const point: Point[i32] = Point.zero();

  @println("{} {}", point.x, Point.tag_of(&point));
}
```

Selection ranks the candidates in this order:

1. a block specialized on the exact concrete type arguments,
2. a block whose bounds hold,
3. a block without bounds,
4. a method declared in the type body,
5. a block whose bounds fail.

Ties keep the block declared first.

## Copy and Drop

A struct is move-only by default, even when every field is `Copy`. `implement Copy : Pair {}` makes assignment and argument passing copy the fields:

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

The marker is not checked against the fields. A struct with a `String` field can become `Copy` too, and then every copy owns the same buffer, which frees it more than once. Keep `Copy` on plain data without owned resources. [Move Semantics](/ownership-types/move-semantics/) explains the ownership side.

An explicit `Drop` runs its own cleanup at scope end:

```zn
struct Label {
  pub text: String,
}

implement Drop : Label {
  fn drop(self) {
    @println("drop {}", self.text);
  }
}

fn main() {
  const label = Label { .text = String.from("first") };

  @println("{}", label.text);
}
```

```text
first
drop first
```

Without an explicit `Drop`, the fields drop in reverse declaration order at scope end. Declaring both `Copy` and `Drop` on one type reports `zeen::typechecker::copy_with_drop`.
