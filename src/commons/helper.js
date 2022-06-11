export const formatTime = (time) => {
    return new Intl.DateTimeFormat('zh-TW', {
        hour: 'numeric', minute: 'numeric'
    }).format(new Date(time))
};