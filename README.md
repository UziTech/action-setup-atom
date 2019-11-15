# Setup Atom and APM in GitHub actions

This action downloads Atom and adds it to the PATH

## Inputs

### `channel`

**Required** The channel to test. Default `"Stable"`.

## Example usage

uses: UziTech/action-setup-atom@v1
with:
  channel: 'Beta'
