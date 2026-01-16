// YouTube API Integration for The Creators Room
// Fetches real-time subscriber count and latest videos from lovetalkies channel

const YOUTUBE_API_KEY = 'AIzaSyCmzahOHOe2J5T_wrWCyef_utCcRxrdSoA';
const CHANNEL_ID = 'UCwSxPLb-R4VtZd4pFSeYLqg'; // lovetalkies channel ID

// Format large numbers (e.g., 5130 -> "5.1K")
function formatCount(count) {
    const num = parseInt(count);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

// Format view count for display
function formatViews(views) {
    const num = parseInt(views);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M views';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K views';
    }
    return num + ' views';
}

// Format date to relative time (e.g., "2 days ago")
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays < 7) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    if (diffWeeks < 4) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    }
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
}

// Fetch channel statistics (subscriber count, video count, view count)
async function fetchChannelStats() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const stats = data.items[0].statistics;
            return {
                subscriberCount: stats.subscriberCount,
                videoCount: stats.videoCount,
                viewCount: stats.viewCount
            };
        }
    } catch (error) {
        console.error('Error fetching channel stats:', error);
    }
    return null;
}

// Fetch latest videos from the channel
async function fetchLatestVideos(maxResults = 6) {
    try {
        // First, get the uploads playlist ID
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
        );
        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
            return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Fetch videos from uploads playlist
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        );
        const videosData = await videosResponse.json();

        if (!videosData.items) {
            return [];
        }

        // Get video IDs to fetch statistics
        const videoIds = videosData.items.map(item => item.snippet.resourceId.videoId).join(',');

        // Fetch video statistics
        const statsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        const statsData = await statsResponse.json();

        // Combine video info with statistics
        return videosData.items.map((item, index) => {
            const stats = statsData.items.find(s => s.id === item.snippet.resourceId.videoId);
            return {
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                publishedAt: item.snippet.publishedAt,
                viewCount: stats?.statistics?.viewCount || '0'
            };
        });
    } catch (error) {
        console.error('Error fetching latest videos:', error);
    }
    return [];
}

// Update stats on the homepage
async function updateHomepageStats() {
    const stats = await fetchChannelStats();

    if (stats) {
        // Update subscriber count
        const subElement = document.querySelector('[data-stat="subscribers"]');
        if (subElement) {
            subElement.textContent = formatCount(stats.subscriberCount);
        }

        // Update video count
        const videoElement = document.querySelector('[data-stat="videos"]');
        if (videoElement) {
            videoElement.textContent = stats.videoCount;
        }

        // Update total views
        const viewsElement = document.querySelector('[data-stat="views"]');
        if (viewsElement) {
            viewsElement.textContent = formatCount(stats.viewCount);
        }

        // Also update stat cards if they exist (by data-value attribute)
        document.querySelectorAll('.stat-card__number[data-value]').forEach(el => {
            const label = el.nextElementSibling?.textContent?.toLowerCase() || '';
            if (label.includes('subscriber')) {
                el.textContent = formatCount(stats.subscriberCount);
                el.setAttribute('data-value', stats.subscriberCount);
            } else if (label.includes('video') && label.includes('published')) {
                el.textContent = stats.videoCount;
                el.setAttribute('data-value', stats.videoCount);
            } else if (label.includes('view')) {
                el.textContent = formatCount(stats.viewCount);
                el.setAttribute('data-value', stats.viewCount);
            }
        });
    }
}

// Update latest videos on daily-read page
async function updateLatestVideos() {
    const videos = await fetchLatestVideos(6);
    const archiveGrid = document.querySelector('.archive-grid');

    if (archiveGrid && videos.length > 0) {
        // Clear existing cards except the last "View All" card
        const existingCards = archiveGrid.querySelectorAll('.archive-card');
        existingCards.forEach(card => card.remove());

        // Add new video cards
        videos.forEach((video, index) => {
            const card = document.createElement('a');
            card.href = `https://www.youtube.com/watch?v=${video.id}`;
            card.target = '_blank';
            card.className = 'archive-card reveal';
            card.innerHTML = `
                <span class="archive-card__date">${formatRelativeTime(video.publishedAt)} • ${formatViews(video.viewCount)}</span>
                <h4 class="archive-card__title">${video.title.substring(0, 50)}${video.title.length > 50 ? '...' : ''}</h4>
                <p class="archive-card__author">lovetalkies</p>
                <span class="archive-card__genre">Audio Story</span>
            `;
            archiveGrid.appendChild(card);
        });

        // Add "View All" card
        const viewAllCard = document.createElement('a');
        viewAllCard.href = 'https://youtube.com/@lovetalkiesaudio';
        viewAllCard.target = '_blank';
        viewAllCard.className = 'archive-card reveal';
        viewAllCard.innerHTML = `
            <span class="archive-card__date">${videos.length}+ Videos</span>
            <h4 class="archive-card__title">View All Episodes</h4>
            <p class="archive-card__author">On YouTube @lovetalkiesaudio</p>
            <span class="archive-card__genre">All Stories</span>
        `;
        archiveGrid.appendChild(viewAllCard);
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the homepage
    if (document.querySelector('.stats-grid')) {
        updateHomepageStats();
    }

    // Check if we're on the daily-read page
    if (document.querySelector('.archive-grid')) {
        updateLatestVideos();
    }
});

// Export for potential use elsewhere
window.YouTubeAPI = {
    fetchChannelStats,
    fetchLatestVideos,
    updateHomepageStats,
    updateLatestVideos
};
