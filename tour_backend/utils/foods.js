const db = require('../db/database');
const { imageUrl } = require('./media');
const { normalize } = require('./places');

function toDto(row, spots, req) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    shortDesc: row.short_desc,
    description: row.description,
    image: imageUrl(req, row.image),
    placeId: row.place_id,
    placeName: row.place_name || null,
    spots: spots.map((s) => spotDto(s, req)),
  };
}

function spotDto(s, req) {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    image: imageUrl(req, s.image),
  };
}

const SELECT = `
  SELECT f.*, p.name AS place_name
  FROM foods f LEFT JOIN places p ON p.id = f.place_id
`;

function groupSpots() {
  const map = {};
  for (const s of db.prepare('SELECT * FROM food_spots ORDER BY id').all()) {
    (map[s.food_id] ||= []).push(s);
  }
  return map;
}

function listFoods(req, { kind = null, q = '' } = {}) {
  let rows = db.prepare(`${SELECT} ${kind ? 'WHERE f.kind = ?' : ''} ORDER BY f.name`)
    .all(...(kind ? [kind] : []));
  const key = normalize(q).trim();
  if (key) {
    rows = rows.filter((r) => normalize(`${r.name} ${r.short_desc} ${r.kind}`).includes(key));
  }
  const spots = groupSpots();
  return rows.map((r) => toDto(r, spots[r.id] || [], req));
}

function getFood(req, id) {
  const row = db.prepare(`${SELECT} WHERE f.id = ?`).get(id);
  if (!row) return null;
  const spots = db.prepare('SELECT * FROM food_spots WHERE food_id = ? ORDER BY id').all(id);
  return toDto(row, spots, req);
}

function getSpot(req, id) {
  const s = db.prepare('SELECT * FROM food_spots WHERE id = ?').get(id);
  return s ? spotDto(s, req) : null;
}

module.exports = { listFoods, getFood, getSpot, spotDto };
