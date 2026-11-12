---
title: Functions
description: Declarations, main rules, nested functions, function values, generics and never functions.
---

## Declarations

A function declares a name, typed parameters and a return type. A function that returns nothing leaves the return type out. Functions are private by default, `pub` makes them visible outside the module.

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

The last expression in a body is the return value, so `return` is optional there:

```zn
fn double(a: i32) i32 {
  a * 2
}

fn main() {
  @println("{}", double(21));
}
```

`extern fn` declares a symbol from another library. [Extern](/functions-closures/extern/) covers declarations, C ABI and linking.

## Main

The program entry point is `fn main()`. It takes no parameters, has no generics and is not `extern`. The compiler takes it from the root module.

The return type is free. An integer return becomes the process exit code, any other type exits with `0`.

```zn
fn main() i32 {
  return 7;
}
```

Only binary targets need `main`. Object and IR output skip the check.

## Nested functions

A function can be declared inside another function. It is visible in that body only, and it cannot capture the outer variables:

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

A function name without a call is a value of the basic `fn(T...) R` type. Basic function values carry no environment and stay `Copy`.

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

Generic parameters go in brackets after the name. A bound follows the parameter with `:`. Several parameters and generic return types work too:

```zn
fn first[T](items: []T) T {
  return items[0];
}

fn smaller[T: Ord](a: T, b: T) T {
  if (a < b) {
    return a;
  };

  return b;
}

fn main() {
  const nums = {3, 9, 4};

  @println("{}", first(nums[..]));
  @println("{}", smaller(2, 7));
}
```

Arguments infer the type parameters. A type name in `#[...]` pins them by hand: `first#[i32](nums[..])`.

A `where` clause goes on its own line after the return type. It holds constraints that would crowd the signature, such as associated types:

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

Several clauses put the keyword alone and indent each clause one level:

```zn
fn apply[T, F](value: T, f: F) T
  where
    T: Copy,
    F: Callable(T) T
{
  return f(value);
}
```

## Never functions

A function returning `never` gives no control back to the caller. The body has to end in a `never` expression, so a call followed by a semicolon returns `void` and does not fit:

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

`@panic`, `@unreachable` and `@todo` also produce `never`. Statements after a `never` call are unreachable and report `zeen::dataflow::unreachable_code`. In Release a `never` function that does return is undefined behavior.
