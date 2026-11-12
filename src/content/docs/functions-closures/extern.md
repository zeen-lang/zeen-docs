---
title: Extern
description: Native symbols, exported functions, varargs and C sources in the link step.
---

`extern` connects Zeen code with native code. Imported symbols resolve at link time, and missing ones fail the link step.

## Imported functions

`extern fn` without a body declares a symbol from another library. Calls use the C calling convention:

```zn
extern fn malloc(usize) *void;
extern fn free(*void);

fn main() {
  const ptr: *i32 = @as(*i32, malloc(@sizeof(i32)));

  *ptr = 123;

  @println("{}", *ptr);

  free(@as(*void, ptr));
}
```

The linker finds `malloc` and `free` in the C library. Use `--link <LIB>` and `--link-dir <PATH>` for other libraries, covered on [Linking](/toolchain/linking/).

## Exported functions

`extern fn` with a body defines a symbol under its own name, so native code can call it:

```zn
extern fn zeen_answer() i32 {
  return 42;
}

fn main() {
  @println("{}", zeen_answer());
}
```

The symbol keeps the plain name, without the module prefix. `nm binary | grep zeen_answer` shows it in the object.

## Variadic functions

`...` marks a C variadic parameter list. String arguments are passed as pointers:

```zn
extern fn printf([*]const char, ...) i32;

fn main() {
  let _ = printf("value: %d %s\n", 42, "ok");
}
```

## Structs

Struct arguments and returns follow the C ABI of the target, not the host. The compiler passes structs by value where the target requires it, uses the target register or memory rules for small returns and takes field layout from `zeen-layout`.

A matching C declaration makes the two sides agree. `helpers.c`:

```c
#include <math.h>

typedef struct {
    float x;
    float y;
} Vec2;

float vec_length(Vec2 v) {
    return sqrtf(v.x * v.x + v.y * v.y);
}
```

```zn
extern link "helpers.c";

struct Vec2 {
  pub x: f32,
  pub y: f32,
}

extern fn vec_length(v: Vec2) f32;

fn main() {
  @println("{:.1}", vec_length(.{ .x = 3.0, .y = 4.0 }));
}
```

## Variables

`extern let` declares a native global. Storage lives in native code and the declaration takes no initializer.

Variables and functions combine in one C file. `helpers.c`:

```c
int helper_count = 3;

int helper_add(int a, int b) {
    return a + b;
}
```

```zn
extern link "helpers.c";

extern let helper_count: i32;
extern fn helper_add(i32, i32) i32;

fn main() {
  @println("{} {}", helper_count, helper_add(2, 3));
}
```

## Link

`extern link "path"` appends a native source file after the compiled object in the link step. Paths resolve relative to the declaring file. C sources compile with the detected toolchain.

Object output skips `extern link` sources with a warning, since a toolchain that only links object files cannot use them. [Linking](/toolchain/linking/) covers library flags, linker selection and target toolchains.
