---
title: Examples
description: Small programs that use the language end to end.
---

## Hello World
```zeen
fn main() {
  @println("Hello, World!");
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

## Structures
### Functions in bodies
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

### Functions in implements
```zeen
struct Person {
  pub age: u32,
}

implement Person {
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

## Enums
### Without Payloads
```zeen
enum Direction {
  Up,
  Down,
  Left,
  Right
}

fn main() {
  @println("{} - {}", @enumTag(Direction.Up), Direction.Up);
  @println("{} - {}", @enumTag(Direction.Down), Direction.Down);
  @println("{} - {}", @enumTag(Direction.Left), Direction.Left);
  @println("{} - {}", @enumTag(Direction.Right), Direction.Right);
}
```

### With Payloads
```zeen
enum Data {
  int: i32,
  float: f32,
  payload: {
    number: usize,
    name: String,
  }
}

fn main() {
  const data = Data.payload { .number = 0, .name = String.from("mealet") };

  switch (data) {
    .int(value) => @println("int: {}", value),
    .float(value) => @println("float: {}", value),
    .payload(payload) => @println("payload: [{}, {}]", payload.number, payload.name)
  }
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

## Vector Example
```zeen
use std.c.math;

struct Vec {
  pub x: f64,
  pub y: f64,
}

implement Vec {
  pub fn new(x: f64, y: f64) Self {
    .{ .x = x, .y = y }
  }

  pub fn length(*const self) f64 {
    return sqrt(self.x * self.x + self.y * self.y);
  }
}

implement Add : Vec {
  alias Output = Self;

  fn add(self, other: Self) Output {
      .{
        .x = self.x + other.x,
        .y = self.y + other.y
      }
  }
}

implement Display : Vec {
  fn display[T: StrWriter](*const self, out: *T) void {
    out.write_str("{");

    out.write_str(
      @format("{:.2}, {:.2}", self.x, self.y)[..]
    );

    out.write_str("}");
  }
}

fn main() {
  const a = Vec.new(1.0, 2.0);
  const b = Vec.new(5.0, 4.0);

  @println("{}", a + b);
}
```

## C Functions

```zn
use std.c.stdlib;

fn main() {
    const ptr: *i32 = malloc(@sizeof(i32));
    *ptr = 123;

    @println("{}", *ptr);

    free(ptr);
}
```

## Iterating

```zn
fn main() {
  const array = {1, 2, 3, 4};

  for (elem : array) {
    @println("{}", elem);
  }
}
```
```zn
use std.collections.list;

fn main() {
  const list = List.from({1, 2, 3, 4}[..]);

  for (elem : list.iter()) {
    @println("{}", *elem);
  }
}
```

## Comptime Engine
```zn
comptime fn array_type(n: comptime_int) zeen_type {
  return @zeen_type([$(n)]i32);
}

alias Buffer = array_type(3);

fn main() {
  const values: Buffer = {1, 2, 3};
  @println("{}", values[0]);
}
```

## Meta
```zn
fn main() {
  comptime {
    for (field : @fields(String)) {
      @println("{}", field);
    }
  }
}
```

More examples live in the topic pages.
