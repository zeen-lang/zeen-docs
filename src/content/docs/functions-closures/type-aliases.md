---
title: Type Aliases
description: Naming existing types with plain and generic aliases.
---

## Plain Aliases
An alias names an existing type. It is the same type, not a new one: `Meters` and `f64` are interchangeable. Aliases can be `pub`.

```zn
alias Meters = f64;
alias Counter = i32;

let distance: Meters = 3.5;
let plain: f64 = distance;
```

## Generic Aliases
Aliases take generics, with bounds if needed:

```zn
alias Ptr[T] = *T;

alias Comparable[T: Showable] = T;

let x: Comparable[V] = V { .v = 5 };
```

Recursive aliases are rejected:

```zn
alias A = B;
alias B = A;
```
