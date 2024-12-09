var q = {},
  L,
  K = document.createElement('link');
K.href = 'https://cdn.growthmate.xyz/scripts/ad-unit.css';
K.type = 'text/css';
K.rel = 'stylesheet';
document.head.appendChild(K);
L = new IntersectionObserver(
  (j) =>
    j.forEach((z) => {
      const B = z.target.attributes.getNamedItem('data-gm-id').nodeValue;
      if (z.isIntersecting) q[B].timeout = setTimeout(() => S(B), 1000);
      else clearTimeout(q[B].timeout);
    }),
  { threshold: 0.5 },
);
window.growthmate = {
  register: (j) => {
    const z = document.querySelectorAll(`a[data-gm-id="${j}"]`);
    if (z.length > 1) {
      console.error('Ad unit ids must be unique');
      return;
    }
    if (!L) {
      console.error('Missing intersection observer');
      return;
    }
    const B = z[0];
    if (
      ((q[j] ??= {}),
      q[j].unit != null &&
        q[j].creation_time != null &&
        Date.now() - q[j].creation_time <= 1000)
    ) {
      B.replaceWith(q[j].unit);
      return;
    } else if (q[j].status != 'loading')
      (q[j].status = 'loading'),
        (q[j].unit = B),
        R(j)
          .then(() => {
            q[j].status = 'success';
          })
          .catch((D) => {
            console.error('Error requesting advertisment', D),
              B.setAttribute('data-gm-is-error', !0);
            return;
          });
    else return;
    L.observe(B),
      (B.onclick = (D) => {
        const G = D.target.attributes.getNamedItem('data-gm-id').nodeValue;
        return T(G), !0;
      });
  },
  unregister: (j) => {
    delete q[j];
  },
};
var M = async (j) => {
    const z =
      q[j]?.unit.attributes.getNamedItem('data-gm-account-id')?.nodeValue;
    if (z) return z;
    if (window.selector && window.selector.isSignedIn())
      return (await (await window.selector.wallet()).getAccounts())[0]
        .accountId;
    return null;
  },
  P = async (j) => {
    const z = q[j]?.unit.attributes.getNamedItem('data-gm-network')?.nodeValue;
    if (z) return z;
    return null;
  },
  Q = async (j) => {
    const z = q[j]?.unit.attributes.getNamedItem('data-gm-format')?.nodeValue;
    if (z) return z;
    return null;
  },
  R = async (j) => {
    const [z, B, D] = await Promise.all([M(j), P(j), Q(j)]),
      J = await (
        await fetch('https://api.growthmate.xyz/public/v0/rec', {
          body: JSON.stringify({
            account_id: z,
            ad_unit_id: j,
            hint_media_type: D,
            network: B,
            referrer: window.location.href,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
      ).json(),
      E = q[j].unit;
    E.setAttribute('data-gm-is-backup', J.is_backup),
      E.setAttribute('href', J.link),
      E.setAttribute('target', '_blank'),
      E.setAttribute('rel', 'noopener'),
      (E.style.backgroundImage = `url(${J.media_url})`),
      (E.style.backgroundSize = 'contain'),
      (q[j] = {
        ...q[j],
        creation_time: Date.now(),
        rec_id: J.rec_id,
        unit: E,
      });
  },
  S = async (j) => {
    const z = q[j]?.rec_id,
      B = q[j]?.ipr_id;
    if (z == null || !!B) return;
    const G = await (
      await fetch('https://api.growthmate.xyz/public/v0/ipr', {
        body: JSON.stringify({ rec_id: z }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    ).json();
    q[j].ipr_id = G.ipr_id;
  },
  T = async (j) => {
    const z = q[j]?.rec_id,
      B = q[j]?.clk_id;
    if (z == null || !!B) return;
    const G = await (
      await fetch('https://api.growthmate.xyz/public/v0/clk', {
        body: JSON.stringify({ rec_id: z }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    ).json();
    q[j].clk_id = G.clk_id;
  };
