# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A JetBrains Academy / "Learn and Teach" **educational course** ("Mastering Java Streams API", taught to EhB students),
not an application. Content is Java 25 + Gradle 9.8.1 + JUnit 6 + AssertJ. Learners work through it in IntelliJ with the
Educational plugin; the `*-info.yaml` files describe it to that plugin.

## Commands

```bash
./gradlew projects                                   # list task modules (module name = sanitized path, e.g. :Exercises-Exercise-task1)
./gradlew :Exercises-Exercise-task1:test           # tests of one exercise
./gradlew :Exercises-Exercise-task1:test --tests 'CourseTests.listOfAllCustomersWhereLastNameContainsE'   # single test
./gradlew test --continue                            # all tests; exercise tests FAIL on the unsolved stubs by design
./gradlew :<module>:run -PmainClass=Main             # run a lesson's Main (mainClass defaults to "")
```

No linter is configured. `build/` and `out/` are untracked and ignored; never commit them.

## Architecture

**Course layout** (Educational plugin hierarchy, defined by `content:` lists in the yaml files):
`course-info.yaml` → section dir (`section-info.yaml`) → lesson dir (`lesson-info.yaml`) → task dir (`task-info.yaml`, `task.md`, `src/`, `test/`).
Section/lesson/task directory names contain spaces and are used verbatim in the yaml `content:` lists; renaming a directory
means updating the parent yaml too. `*-remote-info.yaml` files are plugin-managed sync metadata, do not hand-edit.

**Task types** (`type:` in `task-info.yaml`) decide how a task is validated:
`theory` (read and run `Main`, no check), `output` (stdout compared with `test/output.txt`), `edu` (JUnit tests in `test/`),
`ide` (free-form). Only `Exercises/` has JUnit tests.

**Build** (`build.gradle` / `settings.gradle`): every directory that contains a `src/` folder becomes its own Gradle subproject
(`settings.gradle` walks the tree). Sources are in `src/` and tests in `test/` (not `src/main/java`). The root `build.gradle`
configures all subprojects (Java 25 toolchain, JUnit + AssertJ, `application` plugin) and holds the `printOutput` hook the
Educational plugin uses for `-PeducationalRun=true`.

**Self-contained tasks, duplicated data:** the Educational plugin needs each task to contain its own files, so the domain
records (`domain/{articles,customer,orders}`) and `Database.java` sample data are **copied into every task**, as plain code in each
task folder (no sync script, by decision). There are 6 distinct versions of `Database.java` (Pitfalls adds `Thread.sleep`; exercise 3
keeps its copy in `test/`; the Introduction's `Order`/`OrderLine` have no `total()`). A change to the shared domain or data must be
repeated in every copy; check with `md5sum` before assuming they are equal.

**Domain:** `Article(id, name)`, `Customer(id, name, lastName)`, `Order(id, customerId, paid, orderLines)`,
`OrderLine(articleId, quantity, price)` + `total()`. Customers exist only in the exercises.

## Course conventions that look like bugs but are not

- **Pitfalls lessons are bad code on purpose** (infinite streams, N+1 calls in a loop, wrong operation order). Do not fix the code;
  improve the explanation in `task.md` only.
- **IntelliJ-suggestion hooks are intentional:** `Collectors.toList()`, lambdas that could be method references,
  `if/else return true/false` in a lambda. The Introduction teaches learners to apply those suggestions. Do not "modernise" them.
- Exercise stubs return `emptyList()`/`null` so tests fail until learners implement them.
- The section/lesson/class names were renamed from the old misspelling to `Exercises` / `Exercise` / `Exercise1` (proposal #3 part 2); older exports of the course (e.g. the zip) still use the old names.

## Improvement proposals

**Hard constraint: the course runs in 3 hours and is already full, so do not add class time.** Markdown is free (the presenter talks
through it), so descriptions, tables and cheat sheets may grow. Do **not** add code or activities: no new lessons, `Main` demos,
exercises or tests, and nothing that makes an existing demo run longer. Code changes are limited to fix, align, trim, reorder or
replace. Proposals that add class time are `parked`; new-topic ideas are kept as markdown-only sections of existing `task.md` files.
