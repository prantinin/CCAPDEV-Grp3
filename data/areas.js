// /data/areas.js

const labs = [
  { value: 1, name: 'Lab 1' },
  { value: 2, name: 'Lab 2' },
  { value: 3, name: 'Lab 3' },
  { value: 4, name: 'Lab 4' },
  { value: 5, name: 'Lab 5' }
];

const areas = [
  {
    upper: [
      { id: 'A1', img: '/Assets/icons/chair1.svg' },
      { id: 'A2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableA.svg',
    mid: { id: 'A5', img: '/Assets/icons/chair-midtaken.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'A3', img: '/Assets/icons/chair3.svg' },
      { id: 'A4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  // Repeat for areaB to areaG...
];

module.exports = { labs, areas };
