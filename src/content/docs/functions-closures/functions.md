---
title: Functions
description: Function declarations, main rules, nested functions, pointers and generics.
---

## Declarations
A function takes params and returns a value. Return type can be omitted for void. Functions are private by default, `pub` makes them visible outside the module. <br/>
Syntax:
```zn
fn add(a: i32, b: i32) i32 {
  return a + b;
}

pub fn greet() {
  @println("hi");
}
```

A value can be returned through a trailing expression, without `return`:
```zn
fn double(a: i32) i32 {
  a * 2
}
```

The entry point is `fn main()`.

## Main Function
The main function takes no params, no generics, is not `extern` and cannot be `pub`. It can return `void` or any int: ints go to the exit code, other types return 0.
```zn
fn main() {
  @println("hi");
}

fn main() i32 {
  return 0;
}
```

## Nested Functions
Functions can be declared inside other functions and are called within that scope:
```zn
fn main() {
  fn helper(a: i32) i32 {
    a + 1
  }

  @println("{}", helper(41));
}
```

## Function Pointers
Passing a function name without calling it gives a function pointer. It has the basic `fn` type, which is always `Copy`:
```zn
extern fn malloc(usize) *void;

let allocator: fn(usize) *void = malloc;
```

## Generic Functions
Functions can have generic params, plain or with bounds, several at once, and can return generics:
```zn
fn first[T](items: []T) T {
  return items[0];
}

fn min[T: Ord](a: T, b: T) T {
  if (a < b) {
    return a;
  };

  b
}

fn swap[K, V](p: Pair[K, V]) Pair[V, K] {
  return Pair { .first = p.second, .second = p.first };
}
```

## Never Functions
A function returning `never` never gives control back to the caller. Each call is checked as unreachable in Debug, in Release a returning `never` function is UB:
```zn
extern fn exit(i32) never;

fn main() {
  exit(123);
}
```
