---
title: Examples
description: Small code examples
---

## Hello World
```zn
fn main() {
  @println("Hello, World!");
}
```

## Formatting Strings
```zn
fn greet_message(name: []const char) String {
  @format("Hello, {}!", name)
}

fn main() {
  @println("{}", greet_message("mealet"));
}
```

## Structures
```zn
struct Person {
  age: u32,

  pub fn new(age: u32) Self {
    Self { .age = age }
  }

  pub fn birthday(*self) {
    self.age += 1;
    @println("Happy, Birthday!");
  }

  pub fn get_age(*const self) u32 {
    self.age
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
  @println("Yeah, I've printed this: {}", value);
}

fn main() {
  print_this(123);
  print_this("hello!");
}
```

## Extern functions (with generic example)
```zn
/* declaration of extern C functions */
extern fn malloc(usize) *void;
extern fn free(*void);

fn alloc_me[T](count: usize) *T {
  malloc(@sizeof(T) * count)
}

fn free_me[T](ptr: *T) {
  free(ptr);
}

fn main() {
  /* Note how we're filling generics in non-type expressions */
  let pointer = alloc_me #[i32](3);

  *pointer = 123;
  *(pointer + 1) = 321;
  *(pointer + 2) = 333;

  @println("{} {} {}", *pointer, *(pointer + 1), *(pointer + 2));

  free_me(pointer);
}
```

## Result and Switch
```zn
fn divide(a: i32, b: i32) Result[i32, String] {
  if (b == 0) {
    return Result.Err(String.from("Division by zero"));
  };

  Result.Ok(a / b)
}

fn main() {
  switch (divide(7, 0)) {
    .Ok(v) => @println("Result: {}", v),
    .Err(e) => @println("Error: {}", e),
  };
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
  fn next(*self) Option[i32] {
    if (self.cur < self.end) {
      let output = self.cur;
      self.cur += 1;

      return Option.Some(output);
    }

    Option.None
  }
}

fn main() {
  let counter = Counter.until(5);

  for (i : counter) {
    @println("{}", i);
  }
}
```

----

More examples of specific language's spheres you'll find in the relevant topics.
