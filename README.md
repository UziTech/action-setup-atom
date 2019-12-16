[![Tests status](https://github.com/UziTech/action-setup-atom/workflows/Tests/badge.svg)](https://github.com/UziTech/action-setup-atom/actions)

# Setup Atom and APM in GitHub actions

This action downloads Atom and adds `atom` and `apm` to the `PATH`

## Inputs

### `channel`

**Required** The channel to test. Default `"stable"`.

## Example usage

```yml
uses: UziTech/action-setup-atom@v1
with:
  channel: 'beta'
```

## Full Example

This example runs tests against Atom stable and beta on Linux, Windows, and MacOS.

```yml
name: "Run Tests"
on:
  pull_request:
  push:
    branches:
      - master

jobs:
  Test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        channel: [stable, beta]
    runs-on: ${{ matrix.os }}
    steps:
    - uses: actions/checkout@v1
    - uses: UziTech/action-setup-atom@v1
      with:
        channel: ${{ matrix.channel }}
    - name: Atom version
      run: atom -v
    - name: APM version
      run: apm -v
    - name: Install dependencies
      run: apm ci
    - name: Run tests 🧪
      run: atom --test spec
```
