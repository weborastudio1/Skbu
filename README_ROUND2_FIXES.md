# WEBORA Studio — Round 2 Fix Build

This build applies the actionable website-code fixes from the supplied Round-2 review.

## Fixed in this build
- Mobile navigation closed state now uses `visibility:hidden` + `pointer-events:none`; menu handlers are guarded.
- Shared JavaScript is page-safe: Home hero and Portfolio logic only run when their elements exist.
- Portfolio is paginated at 12 cards per view with a Load more control.
- Portfolio cards no longer use repeated/mismatched remote screenshot images; they use clean project-preview placeholders until verified screenshots are available.
- Large site images were converted to WebP and compressed; an optimized 1200×630 Open Graph image was added.
- Image references are local/relative and use consistent lowercase filenames.
- Legal pages now have page-specific canonical and Open Graph URLs.
- Home title and Open Graph title were aligned.
- Long domains/emails are protected from horizontal overflow; mobile menu/chat safe-area handling was added.
- Hero touch interaction uses `touch-action: pan-y`.
- Preview/non-production host safeguard adds a `noindex,nofollow,noarchive` robots meta at runtime.
- Contact service dropdown now includes all services listed on Services.
- Public/internal site-editing notes identified in the review were removed or rewritten as visitor-facing copy.
- Vercel static-asset cache headers were added.
- Existing external project links retain `noopener noreferrer`.

## Not silently invented
The review requests verification of client ownership/claims, real team photos/names, business legal entity/GST/Udyam details, a real form backend, and legal review. Those require information or service credentials that were not present in the supplied files, so this build does not fabricate them.

The Contact and Career forms therefore keep the existing email fallback and clearly state that the visitor must actually send the email. A backend endpoint can be connected once WEBORA provides the chosen endpoint/configuration.

## Validation
- JavaScript syntax checked with Node.
- No `kuchnahi-six.vercel.app` URLs remain in HTML.
- Local HTML/CSS/JS/image references checked for missing files.
- Duplicate HTML IDs checked.
