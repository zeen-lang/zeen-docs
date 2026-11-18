---
title: Closures
description: Closure literals, capture semantics, type inference and fat Fn and FnOnce types.
---

A closure is a function written where it is used. It has no name, it can capture the variables around it and its type comes from that capture.

## Literals

Parameters sit between pipes and the body follows:

```zn
fn main() {
  const add = |x: i32| x + 1;

  @println("{}", add(4));
}
```

`||` declares a closure without parameters. A block body returns with `->`:

```zn
fn main() {
  const double = |x: i32| -> i32 {
    return x * 2;
  };

  @println("{}", double(4));
}
```

A closure that captures nothing is a basic `fn` pointer. It is `Copy` and fits any `fn(T...) R` annotation.

## Captures

A closure can read values from the enclosing scope:

```zn
fn main() {
  const n: i32 = 5;
  const add = |x| x + n;

  @println("{}", add(10));
}
```

A closure that only reads a capture stays an `Fn` value and can be called many times, even when the captured value is move-only:

```zn
fn main() {
  const text = String.from("hello");
  const show = || @println("{}", text);

  show();
  show();
}
```

A closure that moves a non-`Copy` capture out becomes `FnOnce` and can be called at most once:

```zn
fn main() {
  let text = String.from("hello");
  let consume = || text;
  let value = consume();

  @println("{}", value);
}
```

The capture is decided by the body, not by an annotation. Reading a `String` borrows it for the call; returning it moves the value into the result and leaves the closure empty.

## Type inference

Closure parameters do not need annotations when something else fixes their type. The hint can come from an expected type, from the body, from a neighbouring parameter or from a call argument:

```zn
fn take(byte: u8) u8 {
  return byte + 1;
}

fn main() {
  const base: u8 = 3;

  const double_it = |x| x * 2;
  const shifted = |x| x + base;
  const mixed = |x: i32, y| x + y;
  const taker = |x| take(x);

  @println("{} {} {} {}", double_it(21), shifted(4), mixed(1, 2), taker(5));
}
```

An expected type wins over the body:

```zn
fn main() {
  const typed: Fn(u8) u8 = |x| x * 2;

  @println("{}", typed(2));
}
```

When nothing anchors a parameter, the compiler reports `zeen::typechecker::closure_param_type_needed`:

```zn
fn main() {
  const broken = |x, y| x + y;
}
```

```text
zeen::typechecker::closure_param_type_needed

  × closure parameter type is unknown
  help: annotate the parameter or store the closure in a typed binding
```

Annotating either parameter is usually enough, since the other one then has a neighbour to lean on.

## Fat types

A capturing closure has a fat type: `Fn` or `FnOnce`. Both are move-only, and a fat value stores three things: the code pointer, a pointer to a heap block holding the captures and a routine that drops them. The block is released when the value is dropped.

An `Fn` value can be called many times and a `FnOnce` value once:

```zn
fn apply(f: Fn(i32) i32, x: i32) i32 {
  return f(x);
}

fn main() {
  const m = 6;
  const r = apply(|x| x * m, 2);

  @println("{}", r);
}
```

A function with a fat parameter is monomorphized per call site, so the concrete closure type stays known and no dynamic dispatch survives into the binary.

## Coercions

| From | To |
|------|----|
| `fn` | `Fn`, `FnOnce` |
| `Fn` | `FnOnce` |

`FnOnce` to `Fn` and fat to basic are forbidden, because the first would allow a second call and the second would drop the environment.

```zn
fn apply_once(f: FnOnce(i32) i32, x: i32) i32 {
  return f(x);
}

fn main() {
  const fat: Fn(i32) i32 = |x| x + 1;

  @println("{}", apply_once(fat, 2));
}
```

## Callable bounds

Most functions only call their argument, so a callable bound describes the requirement better than a fat type:

```zn
fn apply[F: Callable(i32) i32](f: F, x: i32) i32 {
  return f(x);
}

fn main() {
  @println("{}", apply(|x| x + 1, 2));
}
```

`Callable` and `CallableOnce` accept every callable shape instead of forcing the argument into an `Fn` or `FnOnce`:

| Value | `Callable` | `CallableOnce` |
|-------|------------|----------------|
| basic `fn` | yes | yes |
| zero capture closure | yes | yes |
| `Fn` | yes | yes |
| `FnOnce` | no | yes |

A named function and a zero capture closure stay plain `fn` pointers under this bound, so neither gains an environment it does not need:

```zn
fn keep[F: Callable(i32) i32](f: F) F {
  return f;
}

fn double(x: i32) i32 {
  return x * 2;
}

fn main() {
  const named = keep(double);
  const closure = keep(|x| x - 1);

  @println("{} {}", named(1), closure(1));
}
```

`Callable(Args...) R` requires the return type. Leave it out when the closure returns `void`: `Callable(i32)`. `CallableOnce` accepts everything `Callable` accepts, plus `FnOnce`. A callable bound mixes with other bounds through `+`: `F: Callable(i32) i32 + Copy`. A signature that does not match reports `zeen::typechecker::generic_bound_not_satisfied`.

## Generics

A closure may capture a generic parameter when the parameter is `Copy`. The capture is monomorphized with the enclosing function:

```zn
fn twice[T: Copy](value: T) T {
  const grab = || value;

  return grab();
}

fn main() {
  @println("{}", twice(9));
}
```

A zero capture closure inside a generic function binds the enclosing generics too and stays a basic `fn` pointer.

## Globals

A global initializer accepts a named function, an `fn` literal or an `Fn` / `FnOnce` returned by a call. The type annotation is required, like every global:

```zn
fn double(x: i32) i32 {
  return x * 2;
}

fn make(n: i32) FnOnce() i32 {
  return || n;
}

let handler: fn(i32) i32 = double;
let scale: fn(i32) i32 = |x| x * 3;
let lazy: FnOnce() i32 = make(41);

fn main() {
  @println("{} {} {}", handler(4), scale(4), lazy());
}
```
