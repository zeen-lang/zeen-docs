---
title: Examples
description: Small programs that use the language end to end.
---

## Result and switch

```zn
use std.string;

fn divide(a: i32, b: i32) Result[i32, String] {
  if (b == 0) {
    return Result.Err(String.from("Division by zero"));
  };

  return Result.Ok(a / b);
}

fn main() {
  switch (divide(7, 2)) {
    .Ok(v) => @println("Result: {}", v),
    .Err(e) => @println("Error: {}", e),
  }
}
```

## Formatting strings

```zn
fn greet_message(name: []const char) String {
  return @format("Hello, {}!", name);
}

fn main() {
  @println("{}", greet_message("mealet"));
}
```

## Structures

```zn
struct Person {
  pub age: u32,

  pub fn new(age: u32) Self {
    Self { .age = age }
  }

  pub fn birthday(*self) {
    self.age += 1;
    @println("Happy Birthday!");
  }

  pub fn get_age(*const self) u32 {
    return self.age;
  }
}

fn main() {
  let person = Person.new(26);

  person.birthday();

  @println("Current age: {}", person.get_age());
}
```

## Generics

```zn
fn print_this[T: Display](value: T) {
  @println("printed: {}", value);
}

fn main() {
  print_this(123);
  print_this("hello!");
}
```

## Extern functions

```zn
extern fn malloc(usize) *void;
extern fn free(*void);

fn alloc_me[T](count: usize) *T {
  return @as(*T, malloc(@sizeof(T) * count));
}

fn free_me[T](ptr: *T) {
  free(@as(*void, ptr));
}

fn main() {
  const pointer = alloc_me#[i32](3);

  *pointer = 123;
  *(pointer + 1) = 321;
  *(pointer + 2) = 333;

  @println("{} {} {}", *pointer, *(pointer + 1), *(pointer + 2));

  free_me(pointer);
}
```

## Iterators

```zn
struct Counter {
  cur: i32,
  end: i32,

  pub fn until(end: i32) Self {
    Self { .cur = 0, .end = end }
  }
}

implement Iterator : Counter {
  alias Item = i32;

  fn next(*self) Option[i32] {
    if (self.cur < self.end) {
      const output = self.cur;
      self.cur += 1;

      return Option.Some(output);
    }

    return Option.None;
  }
}

fn main() {
  const counter = Counter.until(5);

  for (i : counter) {
    @println("{}", i);
  }
}
```

More examples live in the topic pages.
