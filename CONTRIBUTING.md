# Contributing to Near Blocks

Thank you for your interest in contributing to Near Blocks

## Feature Requests & Bug Reports

To request feature requests please request through our Github issues here https://github.com/Nearblocks/nearblocks/issues/new

Please provide as much information as possible so we can properly understand your request. We will try our best to accomodate features which are high in demand.

Bug reports can also be made through Github issues, again please provide as much information as possible including steps to replicate.

If you believe reporting your bug publicly represents a security risk, please send us
[a message via GitHub Security tab](https://github.com/nearblocks/nearblocks/security/advisories).

## Pull Requests

We use the "fork and pull" model
[described here](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-collaborative-development-models),
where contributors push changes to their personal fork and create pull requests to bring those
changes into the source repository.

Please make pull requests against the `master` branch.

GitHub allows closing issues using keywords. This feature should be used to keep the issue tracker
tidy. However, it is generally preferred to put the "closes #123" text in the PR description
rather than the issue commit; particularly during rebasing, citing the issue number in the commit
can "spam" the issue in question.

Once Pull Request is ready and reviewed by the code owners, it gets squashed into a single commit,
where the commit message should follow
[Conventional Commits](https://commonwealth.im/near/proposal/discussion/264-the-commit-template)
style.

## Code Style

We use [prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to keep our codebase tidy.
