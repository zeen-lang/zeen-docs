---
title: Structures and Methods
description: Struct fields, generic types, method receivers, Copy and Drop behavior.
---

## Structures
A struct is a custom type that holds several values together under one name. Each value is a field with its own name and type. Fields are private by default, `pub` makes them visible outside the module.
```zn
struct Person {
  age: u32,
  pub name: String,
}
```

The construction names every field:
```zn
let person = Person { .age = 26, .name = name };
```

Fields read with dot, writes need a mutable pointer receiver or owned value:
```zn
@println("{}", person.age);
```

## Generic Structures
Structs take generics, with bounds if needed:
```zn
struct Box[T] {
  pub inner: *T,
}

struct DisplayBox[T: Display] {
  inner: T,
}
```

## Generic Methods
Methods can declare their own generics on top of the struct ones:
```zn
struct Wrap[T] {
  inner: T,

  pub fn dup_inner[T: Clone](*const self) T {
    return self.inner.clone();
  }
}
```

## Copy and Drop
A struct is `Copy` only if all its fields are, otherwise it is move-only. A type with `Drop` cannot be `Copy`: pick one. If `Drop` is not implemented explicitly, all fields drop recursively at scope end.
```zn
implement Copy : Tag {}

implement Drop : Tag {
  fn drop(self) {
    @println("drop {}", self.name);
  }
}
```

`implement` blocks can be generic too:
```zn
implement[T] Drop : Box[T] {
  fn drop(self) {
    free(self.inner);
  }
}
```

## Methods
Methods live in struct bodies and take `self` as the first receiver. `Self` is the struct type itself.

| Receiver | Mode |
|----------|------|
| `self` | owned value |
| `const self` | owned, read-only |
| `*self` | mutable borrow |
| `*const self` | read-only borrow |

Example:
```zn
struct Person {
  age: u32,

  pub fn birthday(*self) {
    self.age += 1;
  }
}
```

Static calls go through the type, method calls through the value:
```zn
let person = Person.new(26);
person.birthday();
```
