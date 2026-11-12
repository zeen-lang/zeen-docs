---
title: Type Aliases
description: Naming existing types, generic aliases, bounds and recursive aliases.
---

## Plain aliases

`alias` gives an existing type a second name. The alias expands to its body during typechecking, so it is not a new type and costs nothing at runtime. `Meters` and `f64` interchange freely:

```zn
alias Meters = f64;
alias Counter = i32;
alias Handler = fn(i32) i32;

fn double(x: i32) i32 {
  return x * 2;
}

fn main() {
  const distance: Meters = 3.5;
  const plain: f64 = distance;
  const count: Counter = 3;
  const handler: Handler = double;

  @println("{} {} {}", plain, count, handler(21));
}
```

A `pub` alias is visible to modules that import this one.

## Generic aliases

An alias takes type parameters like a struct. Arguments are substituted into the body:

```zn
alias Ptr[T] = *T;
alias Pair[T] = [2]T;

fn main() {
  const number: i32 = 7;
  const pointer: Ptr[i32] = &number;
  const pair: Pair[i32] = {1, 2};

  @println("{} {}", *pointer, pair[1]);
}
```

The argument count is checked, so `Ptr` without an argument reports `zeen::typechecker::generic_count_mismatch`.

## Bounds

A parameter can carry an interface bound. A concrete argument has to satisfy it:

```zn
alias Printable[T: Display] = T;

struct Label {
  pub text: []const char,
}

implement Display : Label {
  fn display[W: StrWriter](*const self, out: *W) void {
    out.write_str(self.text);
  }
}

struct Box[T: Display] {
  pub inner: Printable[T],
}

fn main() {
  const item: Box[Label] = .{ .inner = .{ .text = "ok" } };

  @println("{}", item.inner);
}
```

A type without the interface reports `zeen::typechecker::generic_bound_not_satisfied`. A generic argument also needs the bound declared in the scope that mentions it.

## Recursive aliases

An alias may not expand into itself. The compiler reports `zeen::typecheck::infinite_recursive_type` when the alias is used:

```zn
alias A = B;
alias B = A;

fn main() {
  const value: A = 1;
}
```
