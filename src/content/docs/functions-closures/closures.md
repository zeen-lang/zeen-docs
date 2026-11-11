---
title: Closures
description: Anonymous functions, capture semantics and fat Fn and FnOnce types.
---

## Literals
A closure is an anonymous function that captures values from its scope:
```zn
let n = 5;
let add = fn(x: i32) i32 { return x + n; };

@println("{}", add(10));
```

A closure without captures is a basic `fn` pointer and is `Copy`.

## Fat Types
A capturing closure has a fat type: `Fn` or `FnOnce`. Both are move-only: captures live in a heap block that travels with the value and is dropped with it. Calls dispatch through the stored pointer, an `Fn` value can be called many times, `FnOnce` at most once. Both types are plain structs with static layout (`{ ptr, env }`) and `Drop`.

```zn
fn apply(f: Fn(i32) i32, x: i32) i32 {
  return f(x);
}

let m = 6;
let r = apply(fn(x: i32) i32 { return x * m; }, 2);
```

## Coercions
| From | To |
|------|----|
| `fn` | `Fn`, `FnOnce` |
| `Fn` | `FnOnce` |

`FnOnce` to `Fn` and fat to basic are forbidden.

## Generics
Functions over fat params monomorphize per call site:
```zn
fn apply[T](val: T, f: FnOnce(T) T) T {
  f(val)
}

fn main() {
  let f = fn(x: i32) i32 { x * 2 };
  @println("{}", apply(5, f));
}
```

A closure may capture a generic parameter when the parameter is `Copy`. The capture is monomorphized with the enclosing function:
```zn
fn twice[T: Copy](value: T) T {
  let grab = fn() T { value };
  return grab();
}

fn main() {
  @println("{}", twice(9));
}
```

Bounds of the enclosing function are not inherited by the closure body, so a closure that relies on an interface bound takes a concrete type instead.

A zero capture closure inside a generic function binds the enclosing generics as well and stays a basic `fn` pointer.

## Globals
Global initializers accept function values: a named function, an anonymous `fn` literal or a `Fn` / `FnOnce` returned by a call. The compiler routes them through a synthesized init function.
```zn
let scale: fn(i32) i32 = fn(x: i32) i32 { x * 2 };

fn make(n: i32) FnOnce() i32 {
  return fn() i32 { n };
}

let lazy: FnOnce() i32 = make(41);
```
