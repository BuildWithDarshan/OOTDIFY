# OOTDIFY
OOTDIFY is a modern fashion discovery platform that helps users explore curated outfit inspirations, wardrobe essentials, style tips, and the latest trends with seamless shopping redirects.

## Outfit of the Day rotation

The backend chooses one active men's outfit and one active women's outfit per India calendar day. It prioritizes outfits that have never been featured; after every outfit has had a turn, it chooses the one featured least recently. Manual **Set as OOTD** selections remain in place until the next midnight in `Asia/Kolkata`. When a gender has only one active outfit, that outfit can repeat.

The client OOTD request checks the day before reading, so the first visitor after midnight triggers the rotation. A continuously running local server also schedules a midnight check. The backend Vercel project uses `server/vercel.json` to call `GET /api/admin/ootd/rotate` daily at 19:00 UTC (00:30 IST) as a fallback. Set a random `CRON_SECRET` of at least 16 characters in the backend Vercel project's **Production** environment before deploying; Vercel sends it as a bearer token to the cron endpoint. The Vercel project's Root Directory must be `server` for this `vercel.json` to apply.

Vercel Hobby cron invocations can occur anywhere within their scheduled hour, so the cron alone cannot guarantee an unattended update at exactly midnight. The first OOTD request after midnight provides the immediate rollover for visitors. See [Vercel Cron Jobs accuracy](https://vercel.com/docs/cron-jobs/manage-cron-jobs#cron-jobs-accuracy).

The old implementation cleared `ootdDate` when an outfit stopped being featured. Past rotations without a retained date cannot be reconstructed; `lastOOTDAt` records every new automatic or manual selection going forward.
