---
title: Pointers
description: Single pointers, dereference, casts and element based arithmetic.
---

## Single Pointers
A single pointer holds the address of one value. `*T` points to mutable data, `*const T` to read-only data. To get a pointer, apply addr-of `&` to an expression. Pointers are always `Copy`, and an empty pointer is `nullptr`, which can be compared with `==` and `!=`.

Calls see through pointers to the inner value: `ptr.len()`, `@println!("{}", ptr)` and `ptr[..]` work the same as on the value itself.

```zn
let num = 123;
let ptr = &num;
let null_ptr: *i32 = nullptr;

if (ptr != nullptr) {
  @println("ptr is not null");
}
```

## Dereference
The pointed data is accessed only through dereference `*ptr`. The same dereference modifies the data the pointer points to, if the pointer itself is mutable.

```zn
let num = 123;
let ptr = &num;

*ptr = 0;

@println("{}", num);
```

## Casts
Pointers cast to integers and back, the usual target is `usize`. Single and many pointers cast to each other explicitly with `@as`, and any pointer casts to `*void` and back.

```zn
let addr = @as(usize, ptr);
let back = @as(*i32, addr);
```

## Arithmetic
Pointer arithmetic moves by elements, not bytes: `ptr + 1` points to the next value of type `T`. Integers can be added and subtracted from both sides. Subtracting one pointer from another gives the element distance as `isize`.

```zn
let next = ptr + 1;
let diff: isize = next - ptr;
```
