// Growthmate Ad Unit Manager v0.3.2

const LOCAL = false;

const MIN_ONSCREEN_TIME = 1000;
const MIN_ONSCREEN_PERCENTAGE = 50;
const DEBOUNCE_TIME = 1000;

const API_BASE_URL = LOCAL
  ? 'http://localhost:3000'
  : 'https://api.growthmate.xyz';
const CDN_BASE_URL = LOCAL
  ? 'http://localhost:8080'
  : 'https://cdn.growthmate.xyz/scripts';

const state = {};

let intersectionObserver;

const stylesheet = document.createElement('link');
stylesheet.href = `${CDN_BASE_URL}/v0.3.2/ad-unit.css`;
stylesheet.type = 'text/css';
stylesheet.rel = 'stylesheet';

document.head.appendChild(stylesheet);

intersectionObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      const id = e.target.attributes.getNamedItem('data-gm-id')?.nodeValue;
      if (!id) return;
      if (!state[id]) {
        state[id] = {};
      }
      if (e.isIntersecting)
        state[id]['timeout'] = setTimeout(
          () => registerImpression(id),
          MIN_ONSCREEN_TIME,
        );
      else clearTimeout(state[id]['timeout']);
    }),
  { threshold: MIN_ONSCREEN_PERCENTAGE / 100 },
);

window['growthmate'] = {
  register: (id) => {
    const units = document.querySelectorAll(`a[data-gm-id="${id}"]`);

    if (units.length > 1) {
      console.error('Ad unit ids must be unique');
      return;
    }

    if (!intersectionObserver) {
      console.error('Missing intersection observer');
      return;
    }

    const unit = units[0];

    state[id] ??= {};

    if (
      state[id]['unit'] != undefined &&
      state[id]['creation_time'] != undefined &&
      Date.now() - state[id]['creation_time'] <= DEBOUNCE_TIME
    ) {
      unit.replaceWith(state[id]['unit']);
      return;
    } else if (state[id]['status'] != 'loading') {
      state[id]['status'] = 'loading';
      state[id]['unit'] = unit;
      serve(id)
        .then(() => {
          state[id]['status'] = 'success';
          intersectionObserver.observe(unit);
        })
        .catch((err) => {
          console.error('Error requesting advertisment', err);
          unit.setAttribute('data-gm-is-error', true);
          return;
        });
    } else {
      return;
    }

    unit.onclick = (e) => {
      const id = e.target.attributes.getNamedItem('data-gm-id').nodeValue;
      registerClick(id);
      return true;
    };
  },

  unregister: (id) => {
    delete state[id];
  },
};

const getAccountId = async (id) => {
  const accountIdAttribute =
    state[id]?.['unit'].attributes.getNamedItem(
      'data-gm-account-id',
    )?.nodeValue;
  if (accountIdAttribute) return accountIdAttribute;

  if (window.selector && window.selector.isSignedIn()) {
    return (await (await window.selector.wallet()).getAccounts())[0].accountId;
  }

  return null;
};

const getNetwork = async (id) => {
  const networkAttribute =
    state[id]?.['unit'].attributes.getNamedItem('data-gm-network')?.nodeValue;
  if (networkAttribute) return networkAttribute;

  return null;
};

const getFormatHint = async (id) => {
  const formatAttribute =
    state[id]?.['unit'].attributes.getNamedItem('data-gm-format')?.nodeValue;
  if (formatAttribute) return formatAttribute;

  return null;
};

const serve = async (id) => {
  const [accountId, network, formatHint] = await Promise.all([
    getAccountId(id),
    getNetwork(id),
    getFormatHint(id),
  ]);

  const request = await fetch(`${API_BASE_URL}/public/v0/rec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account_id: accountId,
      network: network,
      hint_media_type: formatHint,
      ad_unit_id: id,
      referrer: window.location.href,
    }),
  });

  const response = await request.json();

  const unit = state[id]['unit'];

  if (!!response.is_backup)
    unit.setAttribute('data-gm-is-backup', response.is_backup);
  unit.setAttribute('href', response.link);
  unit.setAttribute('target', '_blank');
  unit.setAttribute('rel', 'noopener');
  unit.style.backgroundImage = `url(${response.media_url})`;
  unit.style.backgroundSize = 'contain';
  // unit.style.width = `${response.unit_width}px`;
  // unit.style.height = `${response.unit_height}px`;

  state[id] = {
    ...state[id],
    rec_id: response.rec_id,
    creation_time: Date.now(),
    unit,
  };
};

const registerImpression = async (id) => {
  const rec_id = state[id]?.['rec_id'];
  const ipr_id = state[id]?.['ipr_id'];
  if (rec_id == undefined || !!ipr_id) return;

  const request = await fetch(`${API_BASE_URL}/public/v0/ipr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id }),
  });

  const response = await request.json();

  state[id]['ipr_id'] = response.ipr_id;
};

const registerClick = async (id) => {
  const rec_id = state[id]?.['rec_id'];
  const clk_id = state[id]?.['clk_id'];
  if (rec_id == undefined || !!clk_id) return;

  const request = await fetch(`${API_BASE_URL}/public/v0/clk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id }),
  });

  const response = await request.json();

  state[id]['clk_id'] = response.clk_id;
};
