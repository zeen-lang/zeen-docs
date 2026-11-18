---
title: Functions
description: Declarations, main rules, nested functions, function values, generics and never functions.
---

## Declarations

A function declares a name, typed parameters and a return type. A function that returns nothing leaves the type out. Functions are private by default, and `pub` opens one to other modules:

```zn
fn add(a: i32, b: i32) i32 {
  return a + b;
}

pub fn greet() {
  @println("hi");
}

fn main() {
  @println("{}", add(1, 2));
  greet();
}
```

The last expression of a body is its return value, so `return` is optional in that position:

```zn
fn double(a: i32) i32 {
  a * 2
}

fn main() {
  @println("{}", double(21));
}
```

`extern fn` declares a symbol from another library, with no body. [Extern](/functions-closures/extern/) covers declarations, the C ABI and linking.

## `main`

The entry point is `fn main()`. It takes no parameters, no generics and no `extern`, and the compiler takes it from the root module. Its return type is free:

```zn
fn main() i32 {
  return 7;
}
```

This program exits with code `7`. Any other return type, `void` and `bool` included, exits with `0`. A library build, meaning `--emit OBJ` or `--emit IR`, does not need `main` at all; [Compiler](/toolchain/compiler/) covers the output kinds.

## Nested functions

A function can be declared inside another function. It is visible in that body only and cannot capture the outer variables:

```zn
fn main() {
  fn helper(a: i32) i32 {
    a + 1
  }

  @println("{}", helper(41));
}
```

Capturing needs a closure, covered on [Closures](/functions-closures/closures/). A nested function also cannot be `pub` (`zeen::typechecker::nested_fn_pub`), and reading an outer local reports `zeen::resolver::nested_fn_capture`.

## Function values

A function name without a call is a value of the basic `fn(T...) R` type. These values carry no environment, so they stay `Copy` and pass around freely:

```zn
fn twice(x: i32) i32 {
  return x * 2;
}

fn apply(f: fn(i32) i32, x: i32) i32 {
  return f(x);
}

fn main() {
  const f: fn(i32) i32 = twice;

  @println("{} {}", f(4), apply(twice, 5));
}
```

Pointers and function values cast between each other with `@as`:

```zn
fn hello() i32 {
  return 41;
}

fn main() {
  const raw: *void = @as(*void, hello);
  const back: fn() i32 = @as(fn() i32, raw);

  @println("{}", back());
}
```

Fat `Fn` and `FnOnce` values hold an environment and are move-only. [Closures](/functions-closures/closures/) describes them.

## Generics

Generic parameters go in brackets after the name, and a bound follows each parameter after a colon:

```zn
fn first[T](items: []T) T {
  return items[0];
}

fn smaller[T: Ord](a: T, b: T) T {
  if (a < b) {
    return a;
  }

  return b;
}

fn main() {
  const nums = {3, 9, 4};

  @println("{}", first(nums[..]));
  @println("{}", smaller(2, 7));
}
```

The arguments infer the parameters. A type name in `#[...]` pins them by hand: `first#[i32](nums[..])`.

A `where` clause goes on its own line after the return type and holds constraints that would crowd the signature, such as associated types:

```zn
interface Source {
  alias Item;
  fn produce(*self) Item;
}

struct Numbers {
  pub value: i32,
}

implement Source : Numbers {
  alias Item = i32;

  fn produce(*self) i32 {
    return self.value;
  }
}

fn twice[S: Source](source: S) S.Item
  where S.Item = i32
{
  return source.produce() * 2;
}

fn main() {
  const numbers: Numbers = .{ .value = 21 };

  @println("{}", twice(numbers));
}
```

Several constraints put the keyword alone and indent each clause one level:

```zn
fn double(x: i32) i32 {
  return x * 2;
}

fn apply[T, F](value: T, f: F) T
  where
    T: Copy,
    F: Callable(T) T
{
  return f(value);
}

fn main() {
  @println("{}", apply(21, double));
}
```

[Generic Types](/ownership-types/generic-types/) covers inference, monomorphization and the bounds in more depth.

## Never functions

A function returning `never` gives no control back to the caller. Its body has to end in a `never` expression, so a call followed by a semicolon returns `void` and does not fit:

```zn
extern fn exit(i32) never;

fn stop(code: i32) never {
  exit(code)
}

fn main() {
  @println("before");
  stop(3);
}
```

`@panic`, `@unreachable` and `@todo` also produce `never`. A statement after a `never` call is unreachable and reports `zeen::dataflow::unreachable_code`. In Release a `never` function that does return is undefined behavior.
