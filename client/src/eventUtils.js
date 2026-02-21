// Utility function to check if event is completed
export const isEventCompleted = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    return eventDateTime < now;
};

// Get display status for event
export const getEventDisplayStatus = (event) => {
    if (event.status === 'approved' && isEventCompleted(event.date, event.time)) {
        return 'completed';
    }
    return event.status;
};
