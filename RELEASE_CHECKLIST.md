# LAMA Bank — Publication & Cost Checklist

Use this list before posting the public link. Passing functional tests does not by itself establish security readiness.

## Security / privacy — complete before broad public sharing

- [ ] Confirm account, profile, fraud-alert and transaction routes enforce authenticated **server-side** identity and ownership checks. Changing `CustomerId` or `AccountId` must not grant access to another user's data.
- [ ] Check that login and session handling use appropriate server-side verification; frontend `localStorage` alone is not access control.
- [ ] Confirm authorization failures return 401/403 with no sensitive data; consider an automated test for each protected endpoint.
- [ ] Use only synthetic names, email addresses, phone numbers and transactions in the public demo database.
- [ ] Remove or keep private any database dump with real personal details, credential hashes, phone numbers or account records. Check Git history, not only the latest files.
- [ ] Confirm `.env`, deployment secrets, SQL credentials and tokens are absent from Git and GitHub Actions logs; rotate any previously exposed credentials.
- [ ] Confirm Flask debug mode is off on Render, stack traces are not returned to browsers, and any `/db-test` diagnostics are removed or restricted.
- [ ] Restrict CORS to the actual frontend domain, review rate limits and login brute-force protections.
- [ ] Use a separate demo database or disposable demo accounts; do not permit real monetary value or financial information.

## Functionality / user experience

- [x] Owner-reported: all 10 functional test categories passed on the deployed stack.
- [ ] Verify from another browser/device using fresh browser storage and only test credentials.
- [ ] Confirm deep links such as `/login` work after refresh.
- [ ] Confirm error messages are readable when the free Render service sleeps or the SQL database wakes.
- [ ] Recheck backend/frontend links after final GitHub commit.

## Hosting and costs

- [ ] Check Azure SQL pricing tier, free allowance/credits, active billing status and cost alerts.
- [ ] Check Azure Static Web Apps pricing tier.
- [ ] After confirming Render is stable, review and stop/delete old Azure App Service resources as appropriate.
- [ ] **Important:** An Azure App Service Plan may keep billing even if the web app is stopped. Verify whether the plan has other apps and delete the unused plan only after checking dependencies.
- [ ] Check Render free-tier limitations (sleep, startup delay, limits) and outbound IP requirements.
- [ ] Verify the Azure SQL firewall ranges against Render's currently published outbound IP addresses; narrow rules where practical.
- [ ] Set an Azure budget alert or spending limit appropriate to your subscription.

## Public portfolio package

- [ ] Add `README.md` to the root of GitHub repository.
- [ ] Add 3–4 screenshots with synthetic data in `docs/screenshots/` and enable README image links.
- [ ] Add architecture diagram (already included as a Mermaid block in README).
- [ ] Add repository topics: `react`, `flask`, `python`, `azure-sql`, `sql-server`, `fraud-detection`, `full-stack`, `vite`.
- [ ] Add the GitHub live-demo URL to the repository About section.
- [ ] Check the live demo using an incognito window.
- [ ] Record and upload a short walkthrough; add the link to the README.
- [ ] Publish the LinkedIn and portfolio descriptions after final security review.

## Release decision

**Ready for controlled portfolio demonstration:** once sensitive data is removed and access is limited to designated test users.

**Ready for broad public self-registration:** only after stronger backend authorization, privacy and abuse controls are independently verified; this checklist is not a security certification.
