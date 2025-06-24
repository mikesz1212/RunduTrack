document.addEventListener('DOMContentLoaded', () => {
  const link = document.getElementById('openCommunityReports');
  const container = document.getElementById('community-reports-container');

  if (link && container) {
    link.addEventListener('click', () => {
      // Toggle visibility
      container.classList.toggle('hidden');

      // Only embed if it's empty
      if (container.innerHTML.trim() === '') {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://docs.google.com/spreadsheets/d/1_GP22oGi3pQmwBU3J3lA-lIZJBnurHJnEri5AK8syOU/edit?usp=sharing';
        iframe.width = '100%';
        iframe.height = '600';
        iframe.frameBorder = '0';
        iframe.className = 'rounded border border-gray-300 shadow';
        container.appendChild(iframe);
      }
    });
  }
});
