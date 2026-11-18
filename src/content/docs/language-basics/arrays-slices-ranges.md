---
title: Arrays, Slices and Ranges
description: Fixed arrays with brace literals, slice views, ranges and many pointers.
---

An array owns a fixed number of elements, a slice borrows a section of one, and a range names a span of indices. The three work together: a range selects, a slice views, an array stores.

## Arrays

An array has a length known at compile time. Elements go between braces:

```zn
fn main() {
  let numbers = {10, 20, 30};

  numbers[0] = 99;

  @println("{} {}", numbers[0], numbers[2]);
}
```

The type of that literal is `[3]i32`, and the length is part of the type, so `[3]i32` and `[4]i32` are different types. A repeated value uses a count:

```zn
fn main() {
  const buffer: [1024]u8 = {0; 1024};

  @println("{} {}", buffer.len, buffer[1023]);
}
```

Both the count and the length must be known at compile time. Arrays nest like any other value:

```zn
fn main() {
  const matrix = {{1, 2}, {3, 4}};

  @println("{:?}", matrix);
}
```

The length is a field, `array.len`. Arrays have no `len()` method, so `numbers.len()` reports `type usize is not callable`. Containers such as `List` expose `len()` instead, because for them the length is a method on the container.

### Empty arrays

`[0]T` has no runtime representation and is rejected with `zeen::typechecker::empty_array`, whether the value comes from `{}` or from `@uninit()`. An array always holds at least one element.

```zn
fn main() {
  const empty: [0]i32 = {};
}
```

```text
zeen::typechecker::empty_array

  × empty arrays are not allowed
```

Zero-length arrays appear only inside comptime types, where a `comptime struct` may declare a field such as `items: [0]Field`. That form is how reflection describes a struct with no fields, and it never reaches runtime code.

### Braces or a block

Braces carry two meanings. In expression position they always start an array literal, so the right side of a binding is a value:

```zn
fn main() {
  const one = {1};

  @println("{}", one.len);
}
```

In statement position they start a block when the content is statements, which is how a scope groups code:

```zn
fn main() {
  {
    const a = 1;
    const b = 2;

    @println("{}", a + b);
  }
}
```

A bare comma separated list written as a statement is an array literal whose value is thrown away, and the compiler reports `zeen::mir::unused_expression_result`. Bind the array or leave the braces out.

The `[1, 2, 3]` form from older versions is a parser error that points at `{ ... }`.

### Bounds

Indexing starts at zero. An out of bounds read panics in Debug:

:::caution[Release does not check bounds]
With `-m Release` the bounds check is gone, and reading or writing past the end is undefined behavior. The program may return garbage, corrupt another value or crash somewhere unrelated. Keep the index below `len` before indexing, and use a slice when the length is already known.
:::

An array is move-only when its element type is not `Copy`. `{1, 2, 3}` holds `i32` values and copies freely; an array of `String` moves as a whole.

## Slices

A slice is a view into array data. It stores a pointer and a length, and it borrows the data instead of copying it:

```zn
fn main() {
  let numbers = {1, 2, 3, 4, 5};
  const slice = numbers[1..4];

  @println("{} {} {}", slice.len, slice[0], slice[2]);
}
```

A slice has type `[]T` and is always `Copy`. Writes through it reach the original array, so `slice[0] = 9` changes `numbers[1]`. A string literal coerces to `[]const char`, and `[]const T` views the data read only.

The slice syntax accepts every range form:

```zn
fn main() {
  const numbers = {1, 2, 3, 4, 5};

  @println("{:?}", numbers[1..4]);
  @println("{:?}", numbers[..3]);
  @println("{:?}", numbers[2..]);
  @println("{:?}", numbers[1..=3]);
}
```

`a[lo..hi]` excludes `hi` and `a[lo..=hi]` includes it. An out of bounds slice follows the same rule as indexing: it panics in Debug and is undefined in Release.

## Ranges

A range is `Range` from `core.slice`, which is already in scope because core is implicit. It holds an optional start and an optional end, and the literal forms are:

```zn
0..4
0..=4
2..
..3
..=3
..
```

A range can be stored in a binding and reused:

```zn
fn main() {
  const range: Range = 1..4;

  for (i : range) {
    @println("{}", i);
  }
}
```

`Range` is `Copy` and implements `Iterator` over `usize`, so the same value works in slicing and in `for`. [Iterators](/ownership-types/iterators/) covers the interface, and [Constructs](/language-basics/constructs/) covers the loop forms.

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

An array converts to `[*]T` when the element type matches. A many pointer carries no length, so no check protects `ptr[i]`: every bound is the caller's responsibility. [Pointers](/language-basics/pointers/) covers the pointer types and the arithmetic around them.

## Formatting

An array or a slice prints its elements with `{:?}` and shows them between braces:

```text
{1, 2, 3}
{{1, 2}, {3, 4}}
```

`{}` accepts `[N]char` and `[]char` as text and rejects the numeric arrays above. [Printing and Formatting](/language-basics/printing-formatting/) lists the specifiers and explains the difference.
