---
title: Arrays, Slices and Ranges
description: Fixed arrays with brace literals, slice views, ranges and many pointers.
---

## Arrays

An array has a fixed length known at compile time. Elements go between braces:

```zn
fn main() {
  let numbers = {10, 20, 30};

  numbers[0] = 99;

  @println("{} {}", numbers[0], numbers[2]);
}
```

The type of that literal is `[3]i32`. A repeated value uses a count:

```zn
fn main() {
  const buffer: [1024]u8 = {0; 1024};

  @println("{} {}", buffer.len, buffer[1023]);
}
```

The count must be known at compile time. An empty array is `zeen::typechecker::empty_array`, because `[0]T` does not exist, and `{}` without an expected array type is rejected too.

Arrays nest like any other value:

```zn
let matrix = {{1, 2}, {3, 4}};
```

The old `[1, 2, 3]` form is a parser error that points to `{ ... }`. In statement position a leading `{` is an array literal only when it holds a top level comma, otherwise it is a block. Inside an expression, a `{` is always an array literal. A one element array in statement position is therefore written `{1,}`, and a repeated array in tail position needs `return {0; 4};`.

Indexing starts at zero. An out of bounds read panics in Debug and is undefined in Release.

An array is move-only when its element type is not `Copy`.

## Slices

A slice is a view into array data. It stores a pointer and a length, and it borrows the data instead of copying it:

```zn
fn main() {
  let numbers = {1, 2, 3, 4, 5};
  const slice = numbers[1..4];

  @println("{} {} {}", slice.len, slice[0], slice[2]);
}
```

A slice has type `[]T` and is always `Copy`. Writes through it reach the original array. A string literal coerces to `[]const char`, and `[]const T` views the data read only.

The slice syntax covers every range form:

```zn
numbers[1..4]
numbers[..]
numbers[..3]
numbers[2..]
numbers[1..=3]
```

`a[lo..hi]` excludes `hi`, `a[lo..=hi]` includes it. An out of bounds slice panics in Debug and is undefined in Release.

## Ranges

A range is `core.slice.Range` with an optional start and end. The literal forms are:

```zn
lo..hi
lo..=hi
lo..
..hi
..=hi
..
```

A range can be stored in a binding and iterated:

```zn
fn main() {
  const range: Range = 1..4;

  for (i : range) {
    @println("{}", i);
  }
}
```

`Range` is `Copy` and implements `Iterator` over `usize`, so the same value works in slicing and in `for`.

## Many pointers

A many pointer is a C-style pointer with no length. It is written `[*]T`, and elements are reached with `ptr[i]`:

```zn
fn main() {
  let numbers = {104, 101, 108};
  let ptr: [*]i32 = numbers;

  ptr[1] = 121;

  @println("{} {}", ptr[0], ptr[1]);
}
```

An array converts to `[*]T` when the element type matches. A many pointer does not carry a length, so bounds are the caller's responsibility.

## Formatting

An array or slice prints through `{:?}` with its elements, for example `{1, 2, 3}`. `{}` accepts only `[N]char` and `[]char` as text.
