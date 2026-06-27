# Deploy OKSING GEN to Vercel

## Recommended Vercel settings

If `oksing-gen` is the repository root:

```text
Framework Preset: Other
Build Command: empty
Output Directory: .
Install Command: empty
```

If `oksing-gen` is inside a larger repository:

```text
Root Directory: oksing-gen
Framework Preset: Other
Build Command: empty
Output Directory: .
Install Command: empty
```

## GitHub flow

1. Create a GitHub repository.
2. Upload/push the contents of this `oksing-gen` folder.
3. Open Vercel and choose "Add New Project".
4. Import the GitHub repository.
5. Use the settings above.
6. Deploy.

## Notes

- This app is static and does not need a build step.
- `index.html` is the entry point.
- The zine page embeds:

```text
https://odakun.blogspot.com/2026/06/bahasa-rahasia-indonesia.html
```

- Credit/trademark text is shown as:

```text
OKSING GEN by Oda F.T
```
