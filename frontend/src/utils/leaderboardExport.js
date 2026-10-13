import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export full leaderboard as properly formatted multi-page PDF document
 */
export function exportLeaderboardToPDF({
  leaderboard = [],
  eventName = 'QUBIT Code Auctioneer',
  date = null
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  const formattedDate = date || new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let currentY = 14;

  const drawHeader = (pageNum) => {
    // Dark branding strip
    doc.setFillColor(13, 17, 28);
    doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('QUBIT CODE AUCTIONEER', margin + 6, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(188, 140, 255);
    doc.text('Official Competition Leaderboard', margin + 6, currentY + 14);

    // Event & Date right aligned
    doc.setFontSize(9);
    doc.setTextColor(201, 209, 217);
    doc.text(`Event: ${eventName}`, margin + contentWidth - 6, currentY + 8, { align: 'right' });
    doc.text(`Generated: ${formattedDate}`, margin + contentWidth - 6, currentY + 14, { align: 'right' });
    doc.text(`Total Teams: ${leaderboard.length}`, margin + contentWidth - 6, currentY + 20, { align: 'right' });

    currentY += 32;
  };

  const drawTableHeader = () => {
    doc.setFillColor(22, 27, 34);
    doc.rect(margin, currentY, contentWidth, 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);

    doc.text('RANK', margin + 4, currentY + 6);
    doc.text('TEAM NAME', margin + 20, currentY + 6);
    doc.text('LEADER', margin + 78, currentY + 6);
    doc.text('SOLVED', margin + 120, currentY + 6);
    doc.text('BYTECOINS', margin + 142, currentY + 6);
    doc.text('SCORE', margin + contentWidth - 4, currentY + 6, { align: 'right' });

    currentY += 9;
  };

  const drawFooter = (pageNum) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 155);
    doc.text(
      `Page ${pageNum} • QUBIT Competition Platform • Official Record`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  };

  let pageNum = 1;
  drawHeader(pageNum);
  drawTableHeader();

  const rowHeight = 9;

  leaderboard.forEach((team, idx) => {
    if (currentY + rowHeight > pageHeight - 16) {
      drawFooter(pageNum);
      doc.addPage();
      pageNum++;
      currentY = 14;
      drawHeader(pageNum);
      drawTableHeader();
    }

    const rank = idx + 1;
    // Row background alternating
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

    // Rank styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (rank === 1) doc.setTextColor(210, 153, 34);
    else if (rank === 2) doc.setTextColor(100, 116, 139);
    else if (rank === 3) doc.setTextColor(180, 83, 9);
    else doc.setTextColor(100, 116, 139);
    doc.text(`#${rank}`, margin + 4, currentY + 6);

    // Team Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const teamName = team.name || 'Unknown';
    doc.text(teamName.length > 25 ? teamName.slice(0, 24) + '…' : teamName, margin + 20, currentY + 6);

    // Leader
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const leader = team.captainName || team.leaderName || 'Leader';
    doc.text(leader.length > 18 ? leader.slice(0, 17) + '…' : leader, margin + 78, currentY + 6);

    // Solved
    doc.setTextColor(2, 132, 199);
    doc.text(String(team.solvedCount ?? (team.solved || []).length ?? 0), margin + 120, currentY + 6);

    // ByteCoins
    doc.setTextColor(15, 23, 42);
    const balance = team.balance ?? 1000;
    doc.text(`${balance} BC`, margin + 142, currentY + 6);

    // Score
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(109, 40, 217);
    doc.text(`${team.score || 0} pts`, margin + contentWidth - 4, currentY + 6, { align: 'right' });

    currentY += rowHeight;
  });

  drawFooter(pageNum);

  const safeEvent = (eventName || 'QUBIT').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `QUBIT_Leaderboard_${safeEvent}_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Export complete leaderboard as a high-resolution PNG image
 */
export async function exportLeaderboardToPNG({
  leaderboard = [],
  eventName = 'QUBIT Code Auctioneer',
  date = null
}) {
  const formattedDate = date || new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create high-res detached container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.background = '#0d111c';
  container.style.color = '#ffffff';
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  container.style.padding = '36px 40px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border-bottom: 2px solid rgba(188, 140, 255, 0.4); padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div style="font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; display: flex; align-items: center; gap: 8px;">
          <span>QUBIT</span>
          <span style="color: #bc8cff;">//</span>
          <span style="color: #58a6ff;">CODE AUCTIONEER</span>
        </div>
        <div style="font-size: 14px; color: #bc8cff; font-weight: 600; margin-top: 4px;">Official Competition Leaderboard</div>
      </div>
      <div style="text-align: right; font-size: 13px; color: #8b949e;">
        <div><strong style="color: #c9d1d9;">${eventName}</strong></div>
        <div style="margin-top: 3px;">Date: ${formattedDate}</div>
        <div style="margin-top: 3px; color: #58a6ff; font-weight: 600;">Total Teams: ${leaderboard.length}</div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
      <thead>
        <tr style="background: rgba(255, 255, 255, 0.05); color: #8b949e; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.12);">
          <th style="padding: 12px 16px; width: 80px;">Rank</th>
          <th style="padding: 12px 16px;">Team Name</th>
          <th style="padding: 12px 16px;">Leader</th>
          <th style="padding: 12px 16px; text-align: center;">Solved</th>
          <th style="padding: 12px 16px; text-align: center;">ByteCoins</th>
          <th style="padding: 12px 16px; text-align: right;">Score</th>
        </tr>
      </thead>
      <tbody>
        ${leaderboard.map((team, idx) => {
          const rank = idx + 1;
          const rankColor = rank === 1 ? '#f1c40f' : rank === 2 ? '#bdc3c7' : rank === 3 ? '#e67e22' : '#8b949e';
          const bg = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
          return `
            <tr style="background: ${bg}; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
              <td style="padding: 14px 16px; font-weight: 800; color: ${rankColor}; font-size: 15px;">#${rank}</td>
              <td style="padding: 14px 16px; font-weight: 700; color: #ffffff;">${team.name || 'Unknown'}</td>
              <td style="padding: 14px 16px; color: #c9d1d9;">${team.captainName || team.leaderName || 'Leader'}</td>
              <td style="padding: 14px 16px; text-align: center; color: #58a6ff; font-weight: 700;">${team.solvedCount ?? (team.solved || []).length ?? 0}</td>
              <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: #3fb950; font-family: monospace;">${team.balance ?? 1000} BC</td>
              <td style="padding: 14px 16px; text-align: right; font-weight: 800; color: #bc8cff; font-size: 16px; font-family: monospace;">
                ${team.score || 0} pts
                ${team.auctionBonusAwarded && team.bytecoinBonus > 0 ? `<div style="font-size: 11px; color: #e3b341; font-weight: 600;">(+${team.bytecoinBonus} BC)</div>` : ''}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #6e7681; text-align: center;">
      Generated automatically by QUBIT Code Auctioneer Platform • Real-time verified results
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0d111c'
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeEvent = (eventName || 'QUBIT').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `QUBIT_Leaderboard_${safeEvent}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    document.body.removeChild(container);
  }
}
