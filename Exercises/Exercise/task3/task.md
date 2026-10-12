# Exercise 3: unique article names in unpaid orders

## After this lesson you can...

- Filter orders, flatten their order lines and look up related data by id.
- Remove duplicates from a result.

## What to do

1. Open `src/Task.java`. The method currently returns `null`.
2. Complete `Task.returnAllArticleNamesInUnpaidOrders`.

Return the **names** of all articles that appear in **unpaid** orders. Every article name must appear **only once** (the names are **unique**), in **any order**.

Order lines only contain an `articleId`: use the `articles` list to look up the name.

## What you should see

Run `CourseTests`. On the sample `Database` the test is green when your list holds exactly these four names, in any
order: `Chicken`, `Ice Cream`, `Coffee` and `Taco`.

## Key takeaways

- A pipeline can filter, flatten nested data and look up related data by id.
- A result can be made unique.
