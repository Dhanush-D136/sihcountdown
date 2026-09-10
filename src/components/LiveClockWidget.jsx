import React, { useEffect, useState } from 'react';

function getFormattedDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} • ${formattedHours}:${minutes} ${ampm}`;
}

export default function LiveClockWidget() {
  const [timeStr, setTimeStr] = useState(getFormattedDateTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(getFormattedDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="liveClockWidget" className="live-clock-widget">
      <i className="fa-regular fa-clock clock-icon"></i>
      <span>{timeStr}</span>
    </div>
  );
}
