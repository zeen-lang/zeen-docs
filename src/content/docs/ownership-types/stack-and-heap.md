---
title: Stack and Heap
description: Stack allocation, heap allocation and the standard allocator.
---

## Stack

The stack stores values in order and removes them in reverse: last in, first out. Pushing is just moving the top pointer, so it is fast. Everything on the stack has a known fixed size. Locals live here and are freed when the function returns:

```zn
fn main() {
  let num = 123;
  let other = 321;

  @println("{} {}", num, other);
}
```

Each new value pushes on top, and popping goes in reverse when the scope ends. Allocations hoist to the function entry, so loops never grow the stack: a value declared inside a loop reuses the same slot.

## Heap

Data with unknown or changing size lives on the heap. The allocator finds a free spot, marks it used and returns a pointer to it. The pointer itself is fixed-size and sits on the stack, the data follows it. Allocating costs more than pushing: the allocator has to search for a free spot and keep bookkeeping.

Heap memory goes through `Allocator` in `std.alloc`: `alloc` panics on null, `dealloc` frees:

```zn
use std.alloc;

fn main() {
  let block = Allocator.alloc(4);

  Allocator.dealloc(block);

  @println("ok");
}
```

The pointer sits on the stack, the data on the heap. `dealloc` matches `alloc` by address: freeing the wrong pointer, freeing twice or never freeing all break the program in different ways.

`String`, `List` and other containers own heap buffers and release them in their `Drop`, so Zeen code rarely calls `Allocator` directly. The C boundary is the exception: memory from `malloc` belongs to C and must be freed with `free`, not `Allocator.dealloc`. [Extern](/functions-closures/extern/) covers the C bindings, and [Move Semantics](/ownership-types/move-semantics/) explains which values own their data.
