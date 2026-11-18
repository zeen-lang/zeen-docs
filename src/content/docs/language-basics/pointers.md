---
title: Pointers
description: Single and many pointers, dereference, casts and element arithmetic.
---

A pointer holds an address. Zeen has two kinds: the single pointer `*T`, which points at one value, and the many pointer `[*]T`, which points at a run of them and stores no length. Both are `Copy`, and neither changes ownership: the value they point at stays with its binding.

## Single pointers

`*T` points to a mutable value, `*const T` to a read-only one. `&` takes the address of a place, and `nullptr` is the empty pointer:

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

`&` needs a place, so `&123` is rejected while `&num` and `&value.field` work. `*T` converts to `*const T` on its own, which is why a function that only reads takes `*const T` and accepts both.

## Dereference

`*ptr` reads or writes the pointed place. Writing needs a mutable pointee type:

```zn
fn main() {
  let num: i32 = 123;
  const ptr: *i32 = &num;

  *ptr = 0;

  @println("{}", num);
}
```

`num` changes even though `ptr` itself is `const`, because the binding holds the address and the assignment goes through it. Copying that value out of a pointer is a different matter, covered under [Aliased drop](#aliased-drop).

Method calls and format arguments see through a pointer to the inner value, so the deref is implicit:

```zn
use std.string;

fn main() {
  const text: String = String.from("zeen");
  const ptr: *const String = &text;

  @println("{} {}", ptr, ptr.len());
}
```

## Casts

Pointers cast to and from `usize`, and to and from `*void`, which is the type for an address whose pointee type is not known. Two pointer types convert with `@as` as well:

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

A cast keeps the address and does not check that the pointee types match. Casting a `*u8` back to the wrong type compiles and reads garbage.

## Arithmetic

Pointer arithmetic moves by elements, not bytes, so `ptr + 1` points at the next `T`. Subtracting two pointers of the same type gives the distance in elements as `isize`:

```zn
fn main() {
  const values = {10, 20, 30};
  const first: *const i32 = &values[0];
  const last: *const i32 = &values[2];
  const next = first + 1;

  @println("{} {}", *next, last - first);
}
```

`last - first` is `2` here, not the eight bytes between the two `i32` values. Neither operation checks bounds: `first + 5` is a valid pointer value to memory that does not belong to the array.

A pointer to an array is not indexable, so `ptr[0]` on a `*[3]i32` is an error. Dereference first and index the array: `(*ptr)[0]`.

## Aliased drop

Copying a value out of a pointer leaves two owners: the original binding and the copy. For a value with a `Drop`, both would free the same memory, so the compiler rejects the copy:

```zn
use std.string;

fn main() {
  const s = String.from("hi");
  const p = &s;
  const c: String = (*p);

  @println("{}", c);
}
```

```text
zeen::dataflow::aliased_drop

  × dropping `c` copied out of a raw pointer while the source may still own it
  help: clone the value, borrow it, or free the source storage first
```

The way out follows the message. Use `*p` in place instead of binding it, call `p.clone()` when a second owner is really wanted, or take `*const String` as a parameter and keep borrowing.

## Many pointers

`[*]T` points to a run of values with no stored length, and `[*]const T` does the same read only. Index with `p[i]`:

```zn
use std.c.stdlib;

fn main() {
  let buffer: [*]u8 = @as([*]u8, malloc(4));

  buffer[0] = 65;
  buffer[1] = 66;

  @println("{} {}", buffer[0], buffer[1]);

  free(@as(*void, buffer));
}
```

No bounds check protects `p[i]`, because the length is not part of the type. Writing through the index also needs a `let` binding; `const` rejects the assignment even though the pointee is mutable.

The `free` call matters. Memory from `malloc` belongs to C, so no drop runs at the end of `main`, and leaving the call out leaks four bytes. [Extern](/functions-closures/extern/) covers the C bindings themselves, and [Move Semantics](/ownership-types/move-semantics/) explains why Zeen values do not need that call.

## Slices instead

A slice `[]T` keeps a length next to the pointer, so indexing can be checked and `for` can walk it. `[*]T` belongs at the C boundary, where the signature comes from a C header. In Zeen code, take `[]T` or `[]const T` and pass `array[..]` at the call site. [Arrays, Slices and Ranges](/language-basics/arrays-slices-ranges/) covers both types.
