# Exercise 2: names in one list

## After this lesson you can...

- Map different element types to one common type and combine two sources into one list.

## What to do

1. Open `src/Task.java`.
2. Complete `Task.returnAllCustomerNamesAndArticlesNames`.

Return **one list of strings** with all customers as `"firstname lastname"` and all articles by `name`, in any order.

Example: customers `John Doe`, `Jane Doe` and articles `Coffee`, `Pizza` give
`["John Doe", "Jane Doe", "Coffee", "Pizza"]` (any order).

## What you should see

Run `CourseTests`. The test is green when your list has **44** entries (34 customers + 10 articles), in any order, and
contains for example `"John Doe"`, `"Jente Sondervorst"`, `"Elinor O'Quinn"`, `"Coffee"` and `"Ice Cream"`.

## Key takeaways

- `map` turns different element types into one common type (here `String`).
- Two streams of the same type can be combined into one result.
