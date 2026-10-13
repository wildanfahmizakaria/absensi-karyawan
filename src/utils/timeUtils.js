/**
 * timeUtils.js — Utilitas Perhitungan Jam Kerja & Evaluasi Durasi Absensi
 * Aturan Kebijakan Perusahaan CV Mandala Mahardika:
 * - Durasi kerja minimal: 8 Jam 30 Menit (510 menit).
 * - Karyawan dapat absen masuk jam berapapun.
 * - Target minimal absen pulang = Jam Absen Masuk + 8 Jam 30 Menit.
 * - Evaluasi: Kurang atau Lebih dari 8 Jam 30 Menit.
 */

export const MIN_WORK_HOURS = 8;
export const MIN_WORK_MINUTES_PART = 30;
export const MIN_WORK_MINUTES_TOTAL = 510; // 8 * 60 + 30

/**
 * Parsing string waktu ("HH:MM:SS WIB" atau "HH:MM WIB") ke total menit dari 00:00
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const clean = timeStr.replace(/WIB/i, '').trim();
  const parts = clean.split(':').map((p) => parseInt(p, 10));
  const hours = isNaN(parts[0]) ? 0 : parts[0];
  const minutes = isNaN(parts[1]) ? 0 : parts[1];
  return hours * 60 + minutes;
};

/**
 * Format total menit ke string jam WIB ("HH:MM WIB")
 */
export const formatMinutesToWIB = (totalMinutes) => {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;
};

/**
 * Hitung target minimal jam absen pulang: Jam Masuk + 8 Jam 30 Menit
 */
export const calculateMinCheckOutTime = (checkInTimeStr, minMinutes = MIN_WORK_MINUTES_TOTAL) => {
  if (!checkInTimeStr) return '-';
  const inMinutes = parseTimeToMinutes(checkInTimeStr);
  const minOutMinutes = inMinutes + minMinutes;
  return formatMinutesToWIB(minOutMinutes);
};

/**
 * Format selisih menit ke teks ramah ("X jam Y menit" atau "Y menit")
 */
export const formatDurationHuman = (totalMinutes) => {
  const abs = Math.abs(totalMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  if (hours > 0) {
    return `${hours} jam`;
  }
  return `${minutes} menit`;
};

/**
 * Evaluasi durasi kerja antara jam masuk dan jam pulang
 * Membandingkan dengan batas minimal (default: 510 menit / 8 jam 30 menit)
 */
export const evaluateWorkDuration = (checkInStr, checkOutStr, minMinutes = MIN_WORK_MINUTES_TOTAL) => {
  if (!checkInStr || !checkOutStr) {
    return {
      durationMinutes: 0,
      durationFormatted: '-',
      targetMet: false,
      diffMinutes: 0,
      status: 'BELUM_SELESAI',
      statusLabel: 'Belum Selesai',
      badgeVariant: 'neutral',
      keterangan: 'Menunggu proses absen pulang.',
    };
  }

  const inMinutes = parseTimeToMinutes(checkInStr);
  let outMinutes = parseTimeToMinutes(checkOutStr);

  // Antisipasi pergantian hari (shift melewati tengah malam)
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }

  const durationMinutes = outMinutes - inMinutes;
  const durationFormatted = formatDurationHuman(durationMinutes);
  const diffMinutes = durationMinutes - minMinutes;
  const diffFormatted = formatDurationHuman(diffMinutes);

  if (diffMinutes < 0) {
    // Kurang dari 8 jam 30 menit
    return {
      durationMinutes,
      durationFormatted,
      targetMet: false,
      diffMinutes,
      status: 'KURANG',
      statusLabel: `Kurang (${diffFormatted})`,
      badgeVariant: 'danger',
      keterangan: `Kurang dari batas minimal 8 jam 30 menit (-${diffFormatted})`,
      shortLabel: `Kurang (-${diffFormatted})`,
    };
  } else if (diffMinutes === 0) {
    // Tepat 8 jam 30 menit
    return {
      durationMinutes,
      durationFormatted,
      targetMet: true,
      diffMinutes: 0,
      status: 'TEPAT',
      statusLabel: 'Tepat 8j 30m',
      badgeVariant: 'success',
      keterangan: 'Memenuhi batas minimal (Tepat 8 jam 30 menit)',
      shortLabel: 'Tepat (8j 30m)',
    };
  } else {
    // Lebih dari 8 jam 30 menit
    return {
      durationMinutes,
      durationFormatted,
      targetMet: true,
      diffMinutes,
      status: 'LEBIH',
      statusLabel: `Lebih (+${diffFormatted})`,
      badgeVariant: 'success',
      keterangan: `Lebih dari batas minimal 8 jam 30 menit (+${diffFormatted})`,
      shortLabel: `Lebih (+${diffFormatted})`,
    };
  }
};

/**
 * Format jam sekarang dalam string WIB
 */
export const getCurrentWIBString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} WIB`;
};
