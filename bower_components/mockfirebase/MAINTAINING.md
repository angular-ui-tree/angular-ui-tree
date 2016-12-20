# Releasing

Call `gulp release` to release a new patch version. For *minor* or *major* releases, use the `--type` flag:

```bash
$ gulp release --type minor
```

To push the release commit and tag:

```bash
$ git push --follow-tags
```
