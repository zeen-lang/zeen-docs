---
title: Code Examples
description: Complete programs, one per language feature.
---

Each listing compiles as written. The topic pages explain the details behind them.

## Hello World

The smallest program: one function and one macro.

```zn
fn main() {
  @println("Hello, World!");
}
```

## Formatting strings

`@format` builds a heap `String` from a format string and its arguments.

```zn
fn greet_message(name: []const char) String {
  return @format("Hello, {}!", name);
}

fn main() {
  @println("{}", greet_message("mealet"));
}
```

## Result and switch

A function that reports failure in its return type. `switch` reads both cases.

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

Fields plus methods in an `implement` block. Methods can also live in the struct body; [Structures and Methods](/functions-closures/structures-and-methods/) covers both forms.

```zn
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

## Enums without payloads

Variants that carry nothing but their tag. `@enumTag` reads the tag as `u8`.

```zn
enum Direction {
  Up,
  Down,
  Left,
  Right
}

fn main() {
  @println("{} - {}", @enumTag(Direction.Up), Direction.Up);
  @println("{} - {}", @enumTag(Direction.Down), Direction.Down);
}
```

## Enums with payloads

Variants that carry data. `switch` moves the payload into the arm.

```zn
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

A generic function bounded by `Display`, so it accepts any printable value.

```zn
fn print_this[T: Display](value: T) {
  @println("printed: {}", value);
}

fn main() {
  print_this(123);
  print_this("hello!");
}
```

## Operator overloading

`implement Add` makes `+` work on a struct, and `Output` names the type of the result. [Interfaces](/functions-closures/interfaces/) explains interface blocks and `Display`.

```zn
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

```text
{6.00, 6.00}
```

## C functions

`std.c` binds the C standard library. The pointer is freed by hand, because C does not know about Zeen drops.

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

`for` walks an array directly, and a container through its iterator.

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

## Compile-time types

A compile-time function that builds a type. `array_type(3)` becomes `[3]i32` before the program exists. [Compile Time Engine](/ownership-types/compile-time-engine/) covers the three comptime levels.

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

## Compile-time reflection

A `comptime` block runs while the program is built. Its output lands in the build log, not in the program.

```zn
struct User {
  name: String,
  age: u32,
}

fn main() {
  comptime {
    @println("fields of User:");
    for (field : @fields(User)) {
      @println("  {}", field.name);
    }
  }

  @println("program runs");
}
```

```text
[comptime][main.zn:7] fields of User:
[comptime][main.zn:7]   name
[comptime][main.zn:7]   age
```

More examples live in the topic pages.
