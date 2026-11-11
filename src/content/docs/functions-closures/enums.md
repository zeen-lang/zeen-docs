---
title: Enums
description: Enum variants, payload extraction, tags, methods, Copy and Drop rules.
---

## Variants
An enum is a full type system member, just like structs: it can have generics, methods and `implement` blocks. An enum has three kinds of variants: empty, single value and struct. All variants are public automatically.
```zn
enum Value {
  nothing,
  number: i64,
  pair: {
    first: i32,
    second: i32,
  },
}

enum Result[T, E] {
  Ok: T,
  Err: E,
}
```

Struct payload fields are all public and carry no methods of their own.

The construction names the variant:
```zn
let empty_value = Value.nothing;
let lucky_number = Value.number(5);
let point = Value.pair { .first = 5, .second = 6 };
```

## Extraction
Payload reads through `value.variant`. In Debug the tag is checked and a mismatch panics, in Release it reads unchecked. `Copy` payloads copy out, other payloads move out of an owned enum and consume it.
```zn
@println("{}", lucky_number.number);
@println("{}", point.pair.first);
```

The safe way is `switch`: each arm binds the payload to a name, empty variants match by name only.
```zn
switch (point) {
  .nothing => @println("empty"),
  .number(value) => @println("single: {}", value),
  .pair(coords) => @println("pair: {} {}", coords.first, coords.second),
};
```

With `&` the arm binds a `*Payload` pointer into the enum instead of moving the payload out. `&_` discards it. Bare `_` moves the payload into a dead local and drops it, which is a hard error for a non-`Copy` payload (`zeen::mir::discard_drop_payload`).

## Tag
`@enumTag` returns the runtime tag as `u8`:
```zn
@println("{}", @enumTag(empty_value));
```

Only empty-only enums support `==` and `Display`.

## Methods
Enums take the same `self` receivers as structs: `self`, `const self`, `*self`, `*const self`.
```zn
enum Counter {
  zero,
  count: i32,

  pub fn value(self) i32 {
    self.count
  }
}

let current = Counter.count(41);
@println("{}", current.value());
```

Interfaces apply to enums exactly like structs:
```zn
implement Display : Shape {
  fn display[W: StrWriter](*const self, out: *W) void {
    out.write_str("enum");
  }
}
```

## Copy and Drop
Same semantics as structs: an enum is `Copy` when every payload is `Copy`, otherwise move-only. An enum needs a drop if any payload needs one, unless `Drop` is implemented explicitly.
