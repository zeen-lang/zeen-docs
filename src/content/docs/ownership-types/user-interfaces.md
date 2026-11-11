---
title: User Interfaces
description: Declaring interfaces, implementing them for types and bounding generics.
---

## Declaration
An interface declares a behavior shared by many types. Any struct or enum can promise it:
```zn
interface Pet {
  pub fn name(*const self) String;
}
```

## Implement
Types opt in with `implement` blocks and write the promised methods inside. There are no inherent impl blocks: free functions and methods live in struct bodies, interfaces only describe them.
```zn
use std.string;

struct Cat {
  pub nickname: String,
}

implement Pet : Cat {
  fn name(*const self) String {
    String.from("cat")
  }
}
```

## Bounds
Interfaces bound generics. A function over `T: Pet` accepts any type with that behavior and nothing else:
```zn
fn greet[T: Pet](pet: T) {
  @println("hi {}", pet.name());
}

greet(Cat { .nickname = String.from("tom") });
```

`implement` blocks can be generic and bounded too: `Box[T]` is `Copy` exactly when `T` is.
```zn
implement[T: Copy] Copy : Box[T] {}
```
