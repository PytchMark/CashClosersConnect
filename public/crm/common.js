window.crm = {
  token: localStorage.getItem('crm_token'),
  user: JSON.parse(localStorage.getItem('crm_user') || 'null'),
  headers(extra = {}) { return { Authorization: `Bearer ${this.token}`, ...extra }; },
  async api(url, opts = {}) {
    const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...this.headers(opts.headers) } });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Request failed');
    return json;
  },
  bindTabs() {
    document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      const tab = b.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.add('hidden'));
      document.getElementById(tab).classList.remove('hidden');
    }));
  },
  ensure(role) {
    if (!this.token || !this.user || (role && this.user.role !== role)) location.href = '/crm/login';
    const chip = document.getElementById('userChip');
    if (chip) chip.textContent = `${this.user.username} (${this.user.role})`;
  },
  logout() { localStorage.removeItem('crm_token'); localStorage.removeItem('crm_user'); location.href = '/crm/login'; }
};
