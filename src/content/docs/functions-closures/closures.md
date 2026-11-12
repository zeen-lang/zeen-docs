---
title: Closures
description: Closure literals, capture semantics, type inference and fat Fn and FnOnce types.
---

## Literals

A closure is an anonymous function written between pipes:

```zn
const add = |x: i32| x + 1;

@println("{}", add(4));
```

`||` declares a closure without parameters. A block body returns with `->`:

```zn
const double = |x: i32| -> i32 {
  return x * 2;
};

@println("{}", double(4));
```

A closure without captures is a basic `fn` pointer and is `Copy`.

## Captures

A closure can read values from the enclosing scope:

```zn
const n: i32 = 5;
const add = |x| x + n;

@println("{}", add(10));
```

A closure that only reads a capture stays an `Fn` value and can be called many times, even when the captured value is move-only:

```zn
const text = String.from("hello");
const show = || @println("{}", text);

show();
show();
```

A closure that moves a non-`Copy` capture out becomes `FnOnce` and can be called at most once:

```zn
let text = String.from("hello");
let consume = || text;
let value = consume();

@println("{}", value);
```

## Type inference

Closure parameters do not need annotations when the compiler can infer them. The type can come from an expected type, from the body, from a neighbouring parameter or from a call argument.

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
const typed: Fn(u8) u8 = |x| x * 2;

@println("{}", typed(2));
```

When nothing anchors a parameter, the compiler reports `zeen::typechecker::closure_param_type_needed`:

```zn
const broken = |x, y| x + y;
```

Annotate a parameter or store the closure in a typed binding to fix it.

## Fat types

A capturing closure has a fat type: `Fn` or `FnOnce`. Both are move-only. A fat value stores a function pointer, a pointer to a heap block with the captures and a routine that drops them. The captures are released when the value is dropped.

Calls dispatch through the stored pointer. An `Fn` value can be called many times, a `FnOnce` value once.

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

A function with a fat parameter is monomorphized per call site, so the concrete closure type stays known.

## Coercions

| From | To |
|------|----|
| `fn` | `Fn`, `FnOnce` |
| `Fn` | `FnOnce` |

`FnOnce` to `Fn` and fat to basic are forbidden.

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

Most functions only need to call their argument. Prefer a callable bound in that case:

```zn
fn apply[F: Callable(i32) i32](f: F, x: i32) i32 {
  return f(x);
}
```

`Callable` and `CallableOnce` describe what the function does with the closure. A named function stays a plain `fn` pointer and a zero capture closure stays a basic `fn` pointer, so neither is wrapped in a fat value. The bound also infers its own generic arguments from the argument:

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

`Callable(Args...) R` requires the return type. Leave it out when the closure returns `void`: `Callable(i32)`. `CallableOnce` accepts everything `Callable` accepts, plus `FnOnce`. A callable bound mixes with other bounds through `+`: `F: Callable(i32) i32 + Copy`.

| Value | `Callable` | `CallableOnce` |
|-------|------------|----------------|
| basic `fn` | yes | yes |
| zero capture closure | yes | yes |
| `Fn` | yes | yes |
| `FnOnce` | no | yes |

A signature that does not match the bound reports `zeen::typechecker::generic_bound_not_satisfied`.

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

Global initializers accept function values: a named function, an `fn` literal or a `Fn` / `FnOnce` returned by a call. The compiler routes them through a synthesized init function.

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
