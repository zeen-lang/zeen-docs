---
title: Interfaces
description: Declaring interfaces, implementing them with inherent methods, bounding generics and implementing interfaces for builtin types.
---

An interface names a behavior: a method signature that several types can provide. It is the contract; the method itself is written by each type that opts in.

## Declaration

An interface holds method signatures and, when the interface needs them, associated types:

```zn
interface Pet {
  pub fn name(*const self) []const char;
}

fn main() {
}
```

Methods keep the `self` receivers of ordinary methods, so an interface can require a value or a pointer receiver.

## Implement

A type opts in through an interface `implement` block. The header names the interface first and the type after a colon, and the body holds the promised methods:

```zn
interface Pet {
  pub fn name(*const self) []const char;
}

struct Cat {
  pub nickname: []const char,
}

implement Pet : Cat {
  fn name(*const self) []const char {
    return self.nickname;
  }
}

fn main() {
  const cat: Cat = .{ .nickname = "tom" };

  @println("{}", cat.name());
}
```

## Inherent methods

An interface requirement is satisfied by any method with the same name and signature, wherever it is declared. An inherent `implement` block counts, so the method does not have to be written twice:

```zn
interface Describe {
  pub fn describe(*const self) []const char;
}

struct Label {
  pub text: []const char,
}

implement Label {
  pub fn describe(*const self) []const char {
    return self.text;
  }
}

implement Describe : Label {}

fn main() {
  const label: Label = .{ .text = "tag" };

  @println("{}", label.describe());
}
```

`implement Describe : Label {}` carries no methods and is valid because the inherent one already matches. This is the usual style: write the method once in the inherent block and declare the interface with an empty block. The method stays callable on the type even when no generic bound asks for it.

## Bounds

An interface bounds a generic. A function over `T: Pet` accepts any type with that behavior and nothing else:

```zn
interface Pet {
  pub fn name(*const self) []const char;
}

struct Cat {
  pub nickname: []const char,
}

implement Pet : Cat {
  fn name(*const self) []const char {
    return self.nickname;
  }
}

fn greet[T: Pet](pet: T) {
  @println("hi {}", pet.name());
}

fn main() {
  const cat: Cat = .{ .nickname = "tom" };

  greet(cat);
}
```

A type that does not implement the interface is rejected with `zeen::typechecker::generic_bound_not_satisfied`. [Closures](/functions-closures/closures/) shows the same idea with callable bounds.

## Generic implementations

An interface block takes generics and bounds like any other block. The block below makes `Box[T]` `Copy` exactly when `T` is:

```zn
struct Box[T] {
  pub inner: T,
}

implement[T: Copy] Copy : Box[T] {}

fn main() {
  const box: Box[i32] = .{ .inner = 5 };
  const copy = box;

  @println("{} {}", box.inner, copy.inner);
}
```

## Builtin types

A builtin type implements a user interface through the same block shape, with `builtin` in front of the target:

```zn
interface Show {
  pub fn show(*const self) []const char;
}

implement Show : builtin i32 {
  fn show(*const self) []const char {
    return "i32";
  }
}

fn describe[T: Show](value: *const T) []const char {
  return value.show();
}

fn main() {
  const n: i32 = 5;

  @println("{}", n.show());
  @println("{}", describe(&n));
}
```

The target accepts the same shapes as `implement builtin i32`, and the page on [builtin blocks](/functions-closures/implement-builtin/) covers them. An implementation on one concrete type does not extend to another: `f64` still reports `zeen::typechecker::unknown_method` until it gets its own block.

When the method is already declared in an inherent `implement builtin` block, the interface block stays empty:

```zn
interface Tag {
  pub fn tag() u8;
  pub fn tag_of(value: Self) u8;
}

implement builtin i32 {
  fn tag() u8 {
    return 9;
  }

  fn tag_of(value: i32) u8 {
    return @as(u8, value);
  }
}

implement Tag : builtin i32 {}

fn main() {
  const n: i32 = 7;

  @println("{} {}", i32.tag(), i32.tag_of(n));
}
```

A second implementation for the same target is `zeen::typechecker::duplicate_impl`. Core interfaces such as `Add` and `Eq` already come with every builtin type, so implementing one reports `zeen::typechecker::core_interface_impl`.
