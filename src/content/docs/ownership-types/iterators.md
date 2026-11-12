---
title: Iterators
description: for loops over integers, ranges, arrays, slices, containers and custom iterators.
---

`for (x : expr)` runs the body once per element. The loop variable is `const` inside the body.

## Integers and ranges

An integer iterates from `0` up to the number itself. Ranges work the same way, and `..=` includes the end:

```zn
fn main() {
  for (i : 5) {
    @println("int {}", i);
  }

  for (i : 1..=3) {
    @println("range {}", i);
  }
}
```

`for (i : 5)` prints `0` to `4`. `1..=3` prints `1` to `3`.

## Arrays and slices

An array and a slice iterate their elements directly:

```zn
fn main() {
  const numbers = {10, 20, 30};

  for (n : numbers) {
    @println("array {}", n);
  }

  for (n : numbers[1..]) {
    @println("slice {}", n);
  }
}
```

When the element type is move-only, an array loop moves every element out, so using the array afterwards reports `zeen::dataflow::use_after_move`. With a `Copy` element type both forms leave the array usable.

## Containers

`List` offers three directions. `iter` borrows and yields `*const T`, `iter_mut` borrows mutably and yields `*T`, `into_iter` consumes the container and yields owned `T`:

```zn
use std.collections.list;

fn main() {
  let items: List[i32] = List.new();

  items.push(1);
  items.push(2);

  for (item : items.iter()) {
    @println("read {}", *item);
  }

  for (item : items.iter_mut()) {
    *item += 10;
  }

  for (item : items.into_iter()) {
    @println("owned {}", item);
  }
}
```

The three methods come from the `PtrIterator`, `MutPtrIterator` and `OwnedIterator` interfaces, all in `core.iter`. A custom container implements the one that fits: `iter` takes `*const self`, `iter_mut` takes `*self`, and `into_iter` takes `self`. Each block declares `alias Iter = YourIterType;` and returns that iterator.

## Custom iterators

A type iterates by implementing `Iterator`. The interface requires `alias Item` for the element type and `next(*self) Option[Item]`, which returns `Some` until the sequence is done and `None` after that:

```zn
struct Counter {
  cur: i32,
  end: i32,

  pub fn until(end: i32) Self {
    Self { .cur = 0, .end = end }
  }
}

implement Iterator : Counter {
  alias Item = i32;

  fn next(*self) Option[i32] {
    if (self.cur < self.end) {
      const output = self.cur;
      self.cur += 1;

      return Option.Some(output);
    }

    return Option.None;
  }
}

fn main() {
  const counter = Counter.until(3);

  for (i : counter) {
    @println("{}", i);
  }
}
```

Leaving out `alias Item` reports `zeen::typechecker::missing_associated_type`. `next` mutates through `*self`, so the loop keeps the iterator in a mutable slot and advances it.

## Adapters

`Iterator` carries lazy adapters and terminal methods. `map` and `filter` return new iterators, so calls chain:

```zn
use std.collections.list;

fn main() {
  let numbers: List[i32] = List.new();

  numbers.push(1);
  numbers.push(2);
  numbers.push(3);
  numbers.push(4);

  const doubled: List[i32] = numbers
    .iter()
    .map(|x: *const i32| -> i32 { return *x * 2; })
    .filter(|x: i32| -> bool { return x > 4; })
    .collect();

  @println("{} {}", doubled.len(), numbers.iter().count());
}
```

The annotations are optional, since each closure is checked against the callable bound. `map` receives the item type and returns a new one, `filter` receives the mapped value and returns `bool`.

| Adapter | Result |
|---|---|
| `map(f)` | `MapIter`, applies `f` per item |
| `filter(pred)` | `FilterIter`, keeps items where `pred` is `true` |
| `take(count)` | `TakeIter`, stops after `count` items |
| `skip(count)` | `SkipIter`, drops the first `count` items |

Terminal methods consume the iterator:

| Method | Result |
|---|---|
| `count()` | number of items |
| `fold(init, f)` | accumulator after every item |
| `for_each(f)` | `void`, calls `f` per item |
| `any(pred)` / `all(pred)` | `bool` |
| `last_item()` | last item as `Option` |
| `nth(index)` | item at `index` as `Option` |
| `collect()` | a container built from every item |

```zn
use std.collections.list;

fn main() {
  let numbers: List[i32] = List.new();

  numbers.push(1);
  numbers.push(2);
  numbers.push(3);

  const total = numbers.iter().fold(0, |acc: i32, x: *const i32| -> i32 {
    return acc + *x;
  });

  const has_large = numbers.iter().any(|x: *const i32| -> bool {
    return *x > 2;
  });

  @println("{} {}", total, has_large);
}
```

`collect()` builds any type that implements `FromIterator`: `List`, `HashSet` and `String`. The target type comes from the annotation:

```zn
use std.collections.list;

fn main() {
  let letters: List[char] = List.new();

  letters.push('h');
  letters.push('i');

  const text: String = letters.into_iter().collect();

  @println("{}", text);
}
```

Without an annotation the target is unknown and the compiler reports `zeen::typechecker::cannot_infer`.

## Else and labels

A loop `else` block runs only on natural completion. `break` skips it, `continue` does not:

```zn
fn main() {
  const numbers = {1, 2, 3};

  for (n : numbers) {
    if (n == 9) {
      break;
    };
  } else {
    @println("exhausted");
  }
}
```

A name before the loop labels it, and `break :name` or `continue :name` address it from nested loops:

```zn
fn main() {
  outer: for (i : 3) {
    for (j : 3) {
      if (j == 1) {
        continue :outer;
      };

      @println("{} {}", i, j);
    };
  }
}
```

Labels also work on `while`, covered on [Constructs](/language-basics/constructs/).
