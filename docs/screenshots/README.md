# LAMA Bank — Screenshots

[← Main README](../../README.md) · [Testing plan](../TESTING.md)

Place **real screenshots from the deployed application** in this folder after replacing all information with **fictional demo data**. No screenshot images are included in this package; do not invent mock screenshots and present them as live application evidence.

## Suggested filenames

| Filename | What to show |
| --- | --- |
| `login.png` | Clean public login screen; no credentials |
| `register.png` | Registration screen with Back to Login button and empty form |
| `dashboard.png` | Welcome message, accounts, statuses and last-login timestamp using fictional data |
| `transfer.png` | Sender and recipient account numbers, small test amount, friendly response |
| `transactions.png` | Demo transactions and reference account numbers |
| `fraud-alerts.png` | Fraud alert and frozen-account status from isolated synthetic test |
| `frozen-account.png` | Full account number in the friendly frozen-account message |

## Privacy and quality checklist

- Use fictional names, email addresses, phone numbers and account identifiers. Avoid real people's information.
- Do **not** reveal passwords, authentication tokens, `sessionStorage`, `Authorization` headers, connection strings or SQL credentials.
- Keep browser tabs, notification banners and DevTools closed unless illustrating a sanitized technical test.
- Crop screenshots tightly, keep readable text, and use consistent sizes where possible.
- Check accessibility: meaningful screenshot alt text and sufficient contrast.
- Do not publish any historical SQL dump/seed information that includes private identities.

After adding a real image, reference it from the repository-root `README.md`:

```markdown
![LAMA Bank dashboard showing fictional demo accounts](docs/screenshots/dashboard.png)
```

Upload actual `.png` files to this folder via GitHub or commit them locally. Git does not preserve empty directories; this folder is included because it contains this README.
