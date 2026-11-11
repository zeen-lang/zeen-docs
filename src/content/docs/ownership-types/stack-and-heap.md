---
title: Stack and Heap
description: Stack allocation, heap allocation and the standard allocator.
---

## Stack
The stack stores values in order and removes them in reverse: last in, first out. Pushing is just moving the top pointer, so it is fast. Everything on the stack has a known fixed size. Locals live here and are freed when the function returns. Allocations hoist to the function entry, so loops never grow the stack:
```zn
fn main() {
  let num = 123;
  let other = 321;
}
```

Each new value pushes on top, popping goes in reverse:

```
   STACK                               
┌─────────┐          ┌────────────────┐
│   321   │◄─────────│let other = 321;│
├─────────┤          └────────────────┘
│   123   │◄────────┐┌──────────────┐  
├─────────┤         └│let num = 123;│  
│   ...   │          └──────────────┘  
├─────────┤                            
│   ...   │                            
└─────────┘                            
```

## Heap
Data with unknown or changing size lives on the heap. The allocator finds a free spot, marks it used and returns a pointer to it. The pointer itself is fixed-size and sits on the stack, the data follows it. Allocating costs more than pushing: the allocator has to search for a free spot and keep bookkeeping.

Heap goes through `Allocator`: `alloc` panics on null, `dealloc` frees:
```zn
use std.alloc;

fn main() {
  let block = Allocator.alloc(4);
}
```

The pointer sits on the stack, the data on the heap:

```
              STACK                                             
           ┌─────────┐          ┌──────────────────────────────┐
        ┌──┤0xADDRESS│◄─────────│let block = Allocator.alloc(4)│
        │  ├─────────┤          └──────────────────────────────┘
        │  │   ...   │                                          
        │  ├─────────┤                                          
        │  │   ...   │                                          
        │  ├─────────┤                                          
        │  │   ...   │                                          
        │  └─────────┘                                          
        ▼                                                       
┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐                                    
│ │ │ │░│░│░│░│ │ │ │ │ │ │                                    
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘                                    
```
