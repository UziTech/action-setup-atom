[![GitHub Actions Status](https://github.com/UziTech/action-setup-atom/workflows/Tests/badge.svg?branch=master)](https://github.com/UziTech/action-setup-atom/actions)
[![Travis-CI Status](https://travis-ci.com/UziTech/action-setup-atom.svg?branch=master)](https://travis-ci.com/UziTech/action-setup-atom)
[![AppVeyor Status](https://ci.appveyor.com/api/projects/status/b1jl4lp0ud99byfc/branch/master?svg=true)](https://ci.appveyor.com/project/UziTech/action-setup-atom/branch/master)

# Setup Atom and APM

Downloads Atom and add `atom` and `apm` to the `PATH`

This may be used as an [action](#github-action) in GitHub Actions or run with `npx setup-atom` as an [npm package](#npm-package) in GitHub Actions, Travis-CI, and AppVeyor. (It might work in other CI environments but it is only tested in those environments).

## GitHub Action

### Inputs

#### `version`

The version to test. Default `stable`.

Possible values:  `stable`, `beta`, `nightly`, `dev`, Any Atom [release](https://github.com/atom/atom/releases) tag >= `v1.0.0` (e.g. `v1.50.0` or `v1.50.0-beta0`)

### Example usage

```yml
uses: UziTech/action-setup-atom@v1
with:
  version: 'beta'
```

### Full Example

This example runs tests against Atom stable and beta on Linux, Windows, and MacOS.

```yml
jobs:
  Test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        version: [stable, beta]
    runs-on: ${{ matrix.os }}
    steps:
    - uses: actions/checkout@v2
    - uses: UziTech/action-setup-atom@v1
      with:
        version: ${{ matrix.version }}
    - name: Atom version
      run: atom -v
    - name: APM version
      run: apm -v
    - name: Install dependencies
      run: apm ci
    - name: Run tests 🧪
      run: atom --test spec
```

## npm package

`npx setup-atom [ATOM_VERSION] [DOWNLOAD_FOLDER]`

### Examples

#### GitHub Action

```yml
jobs:
  Test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        version: [stable, beta]
    runs-on: ${{ matrix.os }}
    steps:
    - uses: actions/checkout@v2
    - name: Download Atom
    - run: npx setup-atom ${{ matrix.version }}
    - name: Atom version
      run: atom -v
    - name: APM version
      run: apm -v
    - name: Install dependencies
      run: apm ci
    - name: Run tests 🧪
      run: atom --test spec
```

#### Travis-CI

Travis CI doesn't persist the `PATH` between scripts so `setup-atom` writes to a file `../env.sh` which can be used to export the variables with `source ../env.sh`. If anyone knows a way around this a PR would be appreciated. 😉👍

see https://github.com/travis-ci/travis-ci/issues/7472

```yml
before_script:
  - npx setup-atom ${ATOM_VERSION}
  - source ../env.sh # This is needed to persist the PATH between steps

script:
  - apm ci
  - atom --test spec

jobs:
  include:
    - stage: spec tests 👩🏽‍💻
      os: linux
      env: ATOM_VERSION=stable
    - os: linux
      env: ATOM_VERSION=beta
    - os: osx
      env: ATOM_VERSION=stable
    - os: osx
      env: ATOM_VERSION=beta
```

#### AppVeyor

```yml
environment:
  matrix:
  - ATOM_VERSION: stable
  - ATOM_VERSION: beta

install:
  - ps: Install-Product node lts
  - npm ci

before_build:
  - npx setup-atom %ATOM_VERSION%

build_script:
  - apm ci
  - atom --test spec
```
