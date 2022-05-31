/**
 * Get id
 */
const getId = (transId, length) => {
  return parseInt(transId.substring(transId.length - length));
};

/**
 * Check chan le
 */
const checkChanle = (transId, comment) => {
  const id = getId(transId, 1);
  if ((comment === "c" && id % 2 === 1) || (comment === "l" && id % 2 === 0))
    return false;
  return process.env.CHANLE;
};

/**
 * Check tai xiu
 */
const checkTaiXiu = (transId, comment) => {
  const id = getId(transId, 1);
  const tai = [5, 6, 7, 8];
  const xiu = [1, 2, 3, 4];
  if (
    (comment === "t" && tai.includes(id)) ||
    (comment === "x" && xiu.includes(id))
  )
    return process.env.TAIXIU;
  return false;
};

/**
 * Check chan le 2
 */
const checkChanle2 = (transId, comment) => {
  const id = getId(transId, 1);
  const l2 = [1, 3, 5, 7, 9];
  const c2 = [0, 2, 4, 6, 8];
  const x2 = [0, 1, 2, 3, 4];
  const t2 = [5, 6, 7, 8, 9];

  if (
    (comment === "l2" && l2.includes(id)) ||
    (comment === "c2" && c2.includes(id)) ||
    (comment === "x2" && x2.includes(id)) ||
    (comment === "t2" && t2.includes(id))
  )
    return process.env.CHANLE2;
  return false;
};

/**
 * Check gap 3
 */
const checkGap3 = (transId, comment) => {
  const id = getId(transId, 2);
  const id_2 = getId(transId, 3);
  const g3_1 = [
    02, 13, 17, 19, 21, 29, 35, 37, 47, 49, 51, 54, 57, 63, 64, 74, 83, 91, 95,
    96,
  ];
  const g3_2 = [66, 99];
  const g3_3 = [123, 234, 456, 678, 789];
  if (g3_1.includes(id)) {
    return process.env.GAP3_1;
  }
  if (g3_2.includes(id)) {
    return process.env.GAP3_2;
  }
  if (g3_3.includes(id_2)) {
    return process.env.GAP3_3;
  }
  return false;
};

/**
 * Check tong 3 so
 */
const checkTong3So = (transId, comment) => {
  const id = transId.substring(transId.length - 3).split("");
  const total = id.reduce((a, b) => parseInt(a) + parseInt(b));
  if (total === 7 || total === 17 || total === 27) {
    return process.env.TONG3SO_1;
  }
  if (total === 8 || total === 18) {
    return process.env.TONG3SO_2;
  }
  if (total === 9 || total === 19 || total === 29) {
    return process.env.TONG3SO_3;
  }
  return false;
};

/**
 * Check 1 phan 3
 */
const check1Phan3 = (transId, comment) => {
  const id = getId(transId, 1);
  const n1 = [1, 2, 3];
  const n2 = [4, 5, 6];
  const n3 = [7, 8, 9];
  if (
    (comment === "n1" && n1.includes(id)) ||
    (comment === "n2" && n2.includes(id)) ||
    (comment === "n3" && n3.includes(id))
  )
    return process.env.MOTPHAN3;
  return false;
};

/**
 * Check xien
 */
const checkXien = (transId, comment) => {
  const id = getId(transId, 1);
  const cx = [0, 2, 4];
  const lt = [5, 7, 9];
  const ct = [6, 8];
  const lx = [1, 3];

  if (
    (comment === "cx" && cx.includes(id)) ||
    (comment === "lt" && lt.includes(id)) ||
    (comment === "ct" && ct.includes(id)) ||
    (comment === "lx" && lx.includes(id))
  )
    return process.env.XIEN;
  return false;
};

/**
 * check doan so
 */
const checkDoanSo = (transId, comment) => {
  const id = getId(transId, 1);

  for (let i = 0; i < 10; i++) {
    if (comment === `d${i}` && id === i) {
      return process.env.DOANSO;
    }
  }
  return false;
};

/**
 * Check orther
 */
const checkOther = (transId, comment) => {
  return false;
};

module.exports = {
  checkChanle,
  checkTaiXiu,
  checkChanle2,
  checkGap3,
  checkTong3So,
  check1Phan3,
  checkXien,
  checkDoanSo,
  checkOther,
};
