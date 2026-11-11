---
title: Move Semantics
description: Ownership rules, copying, forced Copy and drop behavior.
---

**Move Semantics** is a key feature of Zeen memory management.

## Principles

1. Every value has one owner.
2. Taking a move-only value applies a move operation: the new owner takes full ownership of
the data, and using the previous access point is now an error.
3. Taking a Copy value applies a copy operation: the previous owner is still valid and the new one gets
copied data loaded from memory.
4. Automatic value drops use move semantics to free data only once, by its owner.

### Examples
Copy values example:
```zn
fn main() {
  let a: i32 = 123; // `i32` is a Copy type
  let b = a; // copied value from `a`, so it's still valid

  @println("{} {}", a, b);
}
```

----

Move values example:
```zn
fn main() {
  let lang = String.from("Zeen"); // `String` is a move-only struct
  let next_lang = lang; // moved String instance to the `next_lang` variable
  @println("{}", next_lang);
}
```

----

Use after move example:
```zn
fn main() {
  let lang = String.from("Zeen"); // `String` is a move-only struct
  let next_lang = lang; // moved String instance to the `next_lang` variable

  // Let's use the `lang` variable after moving its ownership
  @println("{}", lang);
}
```
```
zeen::dataflow::use_after_move

  × use of moved value `lang`
   ╭─[test.zn:6:18]
 5 │   // Let's use the `lang` variable after moving its ownership
 6 │   @println("{}", lang);
   ·                  ────
 7 │ }
   ╰────
  help: value `lang` was moved out, borrow or clone it instead
```

----

## Copy Types
Table of compiler marked `Copy` types:

| Type | Copy |
|------|------|
| ints, floats, `bool`, `char` | yes |
| `*T`, `[*]T`, basic `fn` | yes |
| `[]T` (slice) | yes |
| `[N]T` (array) | _if the element is_ |
| struct, enum | _if every field / payload is_ |
| `void`, `never` | yes |

## Forced Copy
`implement Copy` forces a type to be `Copy` regardless of its fields.
This is a promise: the type must really be trivially copyable, the compiler trusts it.
```zn
implement Copy : StructName {}
```

A type with `Drop` cannot be `Copy`: pick one. Without an explicit `Drop`, fields drop recursively at scope end.

## Payload Discard

`.Variant(_)` moves the payload into a dead local and drops it immediately. For a non-copy payload that is a hard error (`zeen::mir::discard_drop_payload`), because the payload may own data. Use `&_` to borrow and discard, or `&name` to keep a pointer:
```zn
switch (value) {
  .number(_) => @println("dropped"),
  .pair(&coords) => @println("{} {}", coords.first, coords.second),
  _ => @println("other"),
};
```

Bare `_` stays legal for `Copy` payloads.
