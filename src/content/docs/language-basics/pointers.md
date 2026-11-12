---
title: Pointers
description: Single and many pointers, dereference, casts and element arithmetic.
---

## Single pointers

`*T` points to one mutable value, `*const T` to a read-only one. `&` takes the address of a place. Pointers are `Copy`, and `nullptr` is the empty pointer, compared with `==` and `!=`:

```zn
fn main() {
  const num: i32 = 123;
  const ptr: *const i32 = &num;
  const empty: *const i32 = nullptr;

  if (ptr != empty) {
    @println("{}", *ptr);
  }
}
```

Method calls and format arguments see through a pointer to the inner value, so no manual deref is needed:

```zn
use std.string;

fn main() {
  const text: String = String.from("zeen");
  const ptr: *const String = &text;

  @println("{} {}", ptr, ptr.len());
}
```

## Dereference

`*ptr` reads or writes the pointed place. Writing needs a mutable pointee:

```zn
fn main() {
  let num: i32 = 123;
  const ptr: *i32 = &num;

  *ptr = 0;

  @println("{}", num);
}
```

## Casts

Pointers cast to and from `usize`, and to and from `*void`. Two pointer types convert with `@as` as well:

```zn
use std.string;

fn main() {
  const text: String = String.from("zeen");
  const ptr: *const String = &text;

  const addr: usize = @as(usize, ptr);
  const raw: *void = @as(*void, ptr);
  const back: *const String = @as(*const String, raw);

  @println("{} {}", back.len(), addr != 0);
}
```

## Arithmetic

Pointer arithmetic moves by elements, not bytes. `ptr + 1` points to the next `T`. Subtracting two pointers gives the distance as `isize`:

```zn
fn main() {
  let values: [3]i32 = {10, 20, 30};
  const ptr: *[3]i32 = &values;
  const next: *[3]i32 = ptr + 1;

  @println("{}", next - ptr);
}
```

Indexing goes through arrays and slices. A pointer to an array is not indexable, read `(*ptr)[0]` instead.

## Many pointers

`[*]T` points to a run of values with no stored length, and `[*]const T` does the same read-only. Index with `p[i]`, the bounds check is on you:

```zn
extern fn malloc(usize) *void;

fn main() {
  let buffer: [*]u8 = @as([*]u8, malloc(4));

  buffer[0] = 65;
  buffer[1] = 66;

  @println("{} {}", buffer[0], buffer[1]);
}
```

A slice `[]T` keeps its length next to the pointer, so prefer it when the count is known. `[*]T` usually appears at the C boundary.
