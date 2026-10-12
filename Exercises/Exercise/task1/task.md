# Exercise 1: filter customers

## After this lesson you can...

- Filter a list on one or more conditions, case-insensitively.
- Combine conditions with and/or.

## What to do

1. Open `src/Exercise1.java`. Each method currently returns an empty list.
2. Complete the three methods. Matching is **case-insensitive**.

- `listOfAllCustomersWhereLastNameContainsE`: customers whose **last name** contains the letter `e`.
- `listOfAllCustomersWhereLastNameContainsEAndNameContainsL`: last name contains `e` **and** first name contains `l`.
- `listOfAllCustomersWhereAnyFieldContainsO`: first name **or** last name contains `o`.

## What you should see

Run `CourseTests`. You are done when all three tests are green. Each test compares the customer ids you return, in any
order, with the expected ids. A test failure shows which customers are missing or unexpected.

## Key takeaways

- A `filter` keeps the elements that match a condition, and a condition can combine tests with `&&` and `||`.
- Compare case-insensitively by lowercasing the text before you test it.
