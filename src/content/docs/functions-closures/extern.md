---
title: Extern
description: Native symbols, exported functions, varargs and C sources in the link step.
---

`extern` is the boundary with native code. It imports functions and globals that the linker takes from a C library, and it exports Zeen functions under plain C names.

## Imported functions

`extern fn` without a body declares a symbol from another library. The call uses the C calling convention, and parameter names are for reading only, so `malloc(usize)` and `malloc(size: usize)` describe the same symbol:

```zn
extern fn malloc(size: usize) *void;
extern fn free(ptr: *void);

fn main() {
  const ptr: *i32 = @as(*i32, malloc(@sizeof(i32)));

  *ptr = 123;

  @println("{}", *ptr);

  free(@as(*void, ptr));
}
```

The C library comes with every target, so `malloc` and `free` need no extra flag. Any other library is passed to the linker with `--link` and `--link-dir`, covered under [Linking](/toolchain/linking/).

## Exported functions

An `extern fn` with a body defines the symbol under its own name, which is how native code calls into Zeen:

```zn
extern fn zeen_answer() i32 {
  return 42;
}

fn main() {
  @println("{}", zeen_answer());
}
```

`nm binary | grep zeen_answer` shows `T zeen_answer`. A plain `pub fn` becomes a module-local symbol such as `main.plain_answer` with lowercase `t`, so an exported function needs the `extern` keyword even when it never leaves Zeen.

## Variadic functions

A trailing `...` marks a C variadic parameter list. Arguments after the fixed parameters are passed as they are, so an integer arrives as `i32` and a string literal as a pointer:

```zn
extern fn printf(format: [*]const char, ...) i32;

fn main() {
  printf("value: %d %s\n", 42, "ok");
}
```

```text
value: 42 ok
```

A call statement drops the returned `i32`, so no `let _ =` is needed. `%d` and `%s` are C format specifiers and are not checked by the compiler; a mismatch reads the wrong argument silently.

## Structures

A struct crosses the boundary with the C ABI of the target, so field order and alignment follow the same rules as the C compiler. A matching C declaration makes both sides agree. `helpers.c`:

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

```text
5.0
```

A struct return goes the other way: `extern fn make_pair(a: i32, b: i32) Pair;` with a C function returning `Pair` compiles and hands back both fields. The C side decides the layout, so write the Zeen struct in field order and use the same primitive widths.

A Zeen struct is move-only by default, while C copies arguments freely. `implement Copy : Vec2 {}` makes a struct passable and readable in any order, which is usually what a C value type wants.

## Variables

`extern let` declares a native global. Storage lives in native code, so the declaration takes no initializer:

```c
int helper_count = 3;

int helper_add(int a, int b) {
    return a + b;
}
```

```zn
extern link "vars.c";

extern let helper_count: i32;
extern fn helper_add(a: i32, b: i32) i32;

fn main() {
  @println("{} {}", helper_count, helper_add(2, 3));
}
```

```text
3 5
```

Reading `helper_count` reads the C variable itself, so a native function that changes it changes what Zeen sees.

## C sources

`extern link "path"` adds a C source to the link step. The path resolves relative to the file that declares it, and the file has to exist with a `.c` extension, otherwise the compiler reports `zeen::resolver::extern_link_error`:

```text
zeen::resolver::extern_link_error

  × extern link error: file doesn't exists
```

The C source compiles with the toolchain for the target and joins the final link, which is how a small helper ships next to the Zeen code without a build script. Toolchains that only link object files, such as `wasm-ld`, skip the sources and print `skipped `extern link` sources: this toolchain only links object files`.

`--link <LIB>` covers the other direction: a library that is already built, such as `raylib` or `m`. `--link-dir <PATH>` adds a search directory for it. [Linking](/toolchain/linking/) lists the flags and the toolchain detection.

## Missing symbols

An import that nothing defines fails the link step with the linker's message:

```text
undefined reference to `definitely_missing_symbol'
collect2: error: ld returned 1 exit status
```

The compiler has already checked the call, so a symbol error here means the library was not linked, the name differs in C or the target expects another ABI.
