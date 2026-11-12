---
title: Move Semantics
description: One owner per value, Copy types, forced Copy, drops and borrowing.
---

Every value has one owner. Moving a value hands ownership to the new place, and the old place becomes invalid. `Copy` types skip this and are duplicated instead. Drops use the same rule, so data is released exactly once.

## Copy and move

Builtin scalars are `Copy`. A copy leaves the source usable:

```zn
fn main() {
  const a: i32 = 123;
  const b = a;

  @println("{} {}", a, b);
}
```

A `String` owns a heap buffer, so it is move-only. The new binding takes the value and the old one cannot be read:

```zn
use std.string;

fn main() {
  const lang = String.from("Zeen");
  const next_lang = lang;

  @println("{}", next_lang);
}
```

Reading the moved binding reports `zeen::dataflow::use_after_move`:

```zn
use std.string;

fn main() {
  const lang = String.from("Zeen");
  const next_lang = lang;

  @println("{}", lang);
}
```

```
zeen::dataflow::use_after_move

  x use of moved value `lang`
  help: value `lang` was moved out, borrow or clone it instead
```

A move also happens when a value is passed by value, stored into a struct field, put in an array or returned. A moved value is dropped by its last owner only.

## What is Copy

| Type | Copy |
|---|---|
| integers, floats, `bool`, `char` | yes |
| `*T`, `[*]T`, basic `fn` values | yes |
| `[]T` slices | yes |
| `[N]T` arrays | when the element type is `Copy` |
| `void`, `never` | yes |
| `Fn` and `FnOnce` | no |
| structs | only with `implement Copy` |
| enums | when every payload is `Copy` |

Structs are move-only by default, even when every field is `Copy`. An enum derives `Copy` on its own when all payloads are `Copy`. [Structures and Methods](/functions-closures/structures-and-methods/) and [Enums](/functions-closures/enums/) show the declarations.

## Forced Copy

`implement Copy : Foo {}` makes a struct or an enum copyable regardless of its fields:

```zn
struct Point {
  pub x: i32,
  pub y: i32,
}

implement Copy : Point {}

fn main() {
  const a: Point = .{ .x = 1, .y = 2 };
  const b = a;

  @println("{} {} {}", a.x, b.x, b.y);
}
```

The compiler trusts the promise and does not inspect the fields. Marking a type with a heap buffer as `Copy` leads to a double free, so add the block only when the value is really trivially copyable.

`Copy` and `Drop` exclude each other. A struct with both reports `zeen::typechecker::copy_with_drop`: a copied value has no way to release a resource once.

## Drop

A type releases resources in `implement Drop : Foo`. The destructor takes `self` by value:

```zn
struct Noisy {
  pub name: []const char,
}

implement Drop : Noisy {
  fn drop(self) {
    @println("drop {}", self.name);
  }
}

fn main() {
  const noise: Noisy = .{ .name = "noise" };

  @println("{}", noise.name);
}
```

The value drops at the end of its scope. Fields drop in reverse declaration order, and locals drop in reverse declaration order too:

```zn
struct Noisy {
  pub name: []const char,
}

implement Drop : Noisy {
  fn drop(self) {
    @println("drop {}", self.name);
  }
}

struct Pair {
  pub first: Noisy,
  pub second: Noisy,
}

fn main() {
  const pair: Pair = .{
    .first = .{ .name = "first" },
    .second = .{ .name = "second" },
  };

  @println("{} {}", pair.first.name, pair.second.name);
}
```

This prints `first second`, then `drop second` and `drop first`. Without an explicit `Drop`, fields drop recursively the same way. A temporary drops at the end of its statement, so a guard returned from a method is released as soon as the expression is done.

## Discarding

`let _ = value;` discards a value without dropping it. The bindings `_name` and `_` differ:

```zn
struct Noisy {
  pub name: []const char,
}

implement Drop : Noisy {
  fn drop(self) {
    @println("drop {}", self.name);
  }
}

fn main() {
  const leaked: Noisy = .{ .name = "leaked" };
  let _ = leaked;

  let _kept = Noisy { .name = "kept" };

  @println("done");
}
```

`leaked` never drops, since `let _ =` releases nothing. `_kept` drops at the end of `main`, printing `drop kept`.

Inside a switch, a bare `_` payload binding moves the payload into a dead local and drops it right away. That is a hard error for a payload that needs a drop (`zeen::mir::discard_drop_payload`), so use `&_` to discard by borrow. [Switch](/functions-closures/switch/) covers both forms.

## Borrowing instead of moving

Most code avoids moves by borrowing. Pass a pointer, call a method on a pointer receiver or take a slice view:

```zn
use std.string;

fn first_len(text: *const String) usize {
  return text.len();
}

fn main() {
  const text: String = String.from("zeen");
  const copy: String = text.clone();

  @println("{} {} {}", text, copy, first_len(&text));
}
```

`clone()` builds a new value when ownership really has to be split.

Reading a whole value through a raw pointer aliases the owner. `const moved: String = (*ptr);` copies the struct without transferring ownership, and both sides free the same buffer. The flow pass rejects that case with `zeen::dataflow::aliased_drop`. Borrow through the pointer, clone, or free the source storage first.
