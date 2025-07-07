# Cloudflare Turnstile Integration

This project now uses **Cloudflare Turnstile** to stop automated table-creation and other abuse vectors. Below is a concise description of the flow and the changes backend developers must implement.

---

## 1. Front-end behaviour

1. The Create-Game screen renders an **Invisible Turnstile** widget (react-turnstile).
2. When the challenge is solved (usually instantly for legitimate browsers), Turnstile returns a _token_ via `onSuccess(token)`.
3. The token is stored in React state (`turnstileToken`). The **Create Game** button stays disabled until:
    - All form fields are valid **and**
    - `turnstileToken` is present.
4. When the user clicks **Create Game** we POST to `POST /create-table` with a JSON body that now includes:

```json
{
    "smallBlind": 1,
    "bigBlind": 2,
    "isCrypto": false,
    "chain": "",
    "cfTurnstileToken": "<token>"
}
```

5. Regardless of success or error, the token is cleared so that the next action requires a fresh challenge.

Environment variables added to **Netlify** build settings:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public-site-key>
```

---

## 2. Back-end requirements

1. **Secret Key**  
   Obtain your secret key from Cloudflare → _Turnstile_ and set it in your server's secret store, e.g.
    ```
    CF_TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
    ```
2. **Validate tokens** on every protected endpoint (currently `POST /create-table`, later possibly `/auth`, etc.):

```python
import requests

def verify_turnstile(token: str, remote_ip: str) -> bool:
    resp = requests.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data={
            "secret": os.environ["CF_TURNSTILE_SECRET_KEY"],
            "response": token,
            "remoteip": remote_ip,
        },
        timeout=3,
    )
    data = resp.json()
    return data.get("success", False)
```

3. **Decision logic**

    - If `verify_turnstile()` returns **False**, respond with **HTTP 403** and do **not** create the table.
    - If **True**, continue with normal processing.

4. **Rate limiting remains important.** Turnstile is not a silver bullet; keep Cloudflare rate-limit and WAF rules in place.

---

## 3. Testing checklist

1. Visit `/create-game` in a normal browser → UI behaves as before.
2. Open DevTools → Network → verify that after solving Turnstile, `cfTurnstileToken` appears in the create-table request body.
3. On the server enable verbose logging for the verification endpoint and watch successful / failed validations.
4. Try cURL-ing `/create-table` **without** a token → server should return 403.

---

## 4. Future endpoints to protect

- `POST /auth` (wallet signature) — prevents auth brute-force.
- `GET /api/init-session` — throttle and optionally gate behind Turnstile if abused.
- WebSocket handshake — issue token pre-upgrade and validate at server side.

---

**Owners:** Front-end: @FE-Team  Back-end: @BE-Team  DevOps: @Ops
