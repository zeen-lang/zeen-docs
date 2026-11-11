---
title: Iterators
description: The for loop, iterable types and custom iterators.
---

## For
Iteration goes through the `for` loop:
```zn
for (item : items) {
  @println("{}", item);
}
```

## Iterable Types
| Type | Yields |
|------|--------|
| integers | numbers |
| ranges | numbers |
| `[N]T`, `[]T` | elements |
| struct with `Iterator` | `next()` values |

Containers like `List` iterate through `.iter()`:

----

```zn
for (x : items.iter()) {}
```

## Custom Iterators
A type iterates by implementing `Iterator`: `next` returns `Some(element)` or `None` when done.
```zn
struct Counter {
  cur: i32,
  end: i32,

  pub fn until(end: i32) Self {
    Self { .cur = 0, .end = end }
  }
}

implement Iterator : Counter {
  fn next(*self) Option[i32] {
    if (self.cur < self.end) {
      let output = self.cur;
      self.cur += 1;

      return Option.Some(output);
    }

    Option.None
  }
}

fn main() {
  let counter = Counter.until(5);

  for (i : counter) {
    @println("{}", i);
  }
}
```
